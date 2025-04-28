import Pusher from "pusher-js";

const NEXT_PUBLIC_PUSHER_APP_KEY = process.env.NEXT_PUBLIC_PUSHER_APP_KEY;
const NEXT_PUBLIC_PUSHER_CLUSTER = process.env.NEXT_PUBLIC_PUSHER_CLUSTER;

if (!NEXT_PUBLIC_PUSHER_APP_KEY || !NEXT_PUBLIC_PUSHER_CLUSTER) {
  throw new Error(
    "NEXT_PUBLIC_PUSHER_APP_KEY and NEXT_PUBLIC_PUSHER_CLUSTER must be provided."
  );
}

const pusherClient = new Pusher(NEXT_PUBLIC_PUSHER_APP_KEY, {
  cluster: NEXT_PUBLIC_PUSHER_CLUSTER,
});

export default pusherClient;
