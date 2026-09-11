// Keep previously shared homepage article links working at the dedicated blog.
(() => {
  const destination = new URL(window.location.href);
  if (!destination.searchParams.get('post')) return;
  destination.pathname = '/blog/';
  destination.hash = '';
  window.location.replace(destination.href);
})();
