import asap from 'asap';


// If the user is using the async API, *always* call it
// asynchronously even if the template was synchronous.
export function callbackAsap(cb, err, res?) {
  asap((): void => {
    cb(err, res);
  });
}
