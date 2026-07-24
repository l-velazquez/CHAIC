import fs from "node:fs";
import path from "node:path";
import Ajv from "ajv";
import addFormats from "ajv-formats";

const root = process.cwd();
const read = (relative) =>
  JSON.parse(fs.readFileSync(path.join(root, relative), "utf8"));
const schema = read("schemas/content.schema.json");
const ajv = new Ajv({ allErrors: true, strict: false });
addFormats(ajv);

const checks = [
  ["event", read("src/_data/event.json"), "event", false],
  ["tickets", read("src/_data/tickets.json"), "ticket", true],
  ["speakers", read("src/_data/speakers.json"), "speaker", true],
  ["sessions", read("src/_data/sessions.json"), "session", true],
  [
    "article approvals",
    read("src/_data/articleApprovals.json"),
    "articleApproval",
    true
  ]
];

for (const [name, data, definition, isArray] of checks) {
  const validate = ajv.compile({
    $defs: schema.$defs,
    ...(isArray
      ? { type: "array", items: { $ref: `#/$defs/${definition}` } }
      : { $ref: `#/$defs/${definition}` })
  });
  if (!validate(data)) {
    throw new Error(
      `${name} failed validation:\n${JSON.stringify(validate.errors, null, 2)}`
    );
  }
}

const tickets = checks.find(([name]) => name === "tickets")[1];
for (const ticket of tickets) {
  const savings = ticket.regularPrice - ticket.price;
  if (savings < 0) {
    throw new Error(`${ticket.id} regular price is lower than its current price.`);
  }
  for (const key of ["nameEs", "audienceEs"]) {
    if (!ticket[key]) throw new Error(`${ticket.id} is missing ${key}.`);
  }
  for (const [english, spanish] of [
    ["included", "includedEs"],
    ["excluded", "excludedEs"]
  ]) {
    if (
      !Array.isArray(ticket[spanish]) ||
      ticket[spanish].length !== ticket[english].length
    ) {
      throw new Error(`${ticket.id} ${english}/${spanish} are not synchronized.`);
    }
  }
}

const speakers = checks.find(([name]) => name === "speakers")[1];
const sessions = checks.find(([name]) => name === "sessions")[1];
const speakerById = new Map(speakers.map((speaker) => [speaker.id, speaker]));
for (const speaker of speakers.filter((record) => record.status === "confirmed")) {
  if (!speaker.bioEs || !speaker.topicsEs?.length) {
    throw new Error(`${speaker.id} is missing confirmed-speaker Spanish content.`);
  }
}
for (const session of sessions) {
  if (new Date(session.endDate) <= new Date(session.startDate)) {
    throw new Error(`${session.id} ends before it starts.`);
  }
  if (!session.titleEs || !session.descriptionEs) {
    throw new Error(`${session.id} is missing Spanish content.`);
  }
  for (const speakerId of session.speakerIds) {
    const speaker = speakerById.get(speakerId);
    if (!speaker) throw new Error(`${session.id} references missing ${speakerId}.`);
    if (speaker.status !== "confirmed") {
      throw new Error(`${session.id} publicly references invited ${speakerId}.`);
    }
  }
}

function leafKeys(value, prefix = "") {
  if (value === null || typeof value !== "object" || Array.isArray(value)) {
    return [prefix];
  }
  return Object.entries(value).flatMap(([key, child]) =>
    leafKeys(child, prefix ? `${prefix}.${key}` : key)
  );
}

const i18n = read("src/_data/i18n.json");
const enKeys = leafKeys(i18n.en).sort();
const esKeys = leafKeys(i18n.es).sort();
if (JSON.stringify(enKeys) !== JSON.stringify(esKeys)) {
  throw new Error("English and Spanish translation keys are not synchronized.");
}

const approvals = checks.find(([name]) => name === "article approvals")[1];
const authors = read("src/_data/authors.json");
const authorIds = new Set(authors.map((author) => author.id));
for (const approval of approvals) {
  if (!authorIds.has(approval.authorId)) {
    throw new Error(`${approval.slug} references missing author ${approval.authorId}.`);
  }
  for (const reviewerId of approval.reviewerIds) {
    if (!authorIds.has(reviewerId)) {
      throw new Error(`${approval.slug} references missing reviewer ${reviewerId}.`);
    }
  }
}

console.log(
  `Validated event, ${tickets.length} tickets, ${speakers.length} speaker records, ${sessions.length} sessions, and translation parity.`
);
