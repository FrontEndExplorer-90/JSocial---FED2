// src/js/router/index.js
export default async function router(evtOrPath) {
  let pathname = typeof evtOrPath === 'string' ? evtOrPath : window.location.pathname;

  // normalize: strip trailing slashes, /index.html, and .html
  let p = pathname
    .replace(/\/+$/, '')
    .replace(/\/index\.html$/i, '')
    .replace(/\.html$/i, '') || '/';

  switch (p) {
    case '/':
      (await import('./views/home.js')).default();
      break;
    case '/post':
      (await import('./views/post.js')).default();
      break;
    case '/post/create':
      (await import('./views/postCreate.js')).default();
      break;
    case '/post/edit':
      (await import('./views/postEdit.js')).default();
      break;
    case '/post/details':
      (await import('./views/postDetails.js')).default();
      break;
    case '/auth':
      (await import('./views/auth.js')).default();
      break;
    case '/auth/login':
      (await import('./views/login.js')).default();
      break;
    case '/auth/register':
      (await import('./views/register.js')).default();
      break;
    case '/profile':
      (await import('./views/profile.js')).default();
      break;
    default:
      (await import('./views/notFound.js')).default?.();
  }
}
