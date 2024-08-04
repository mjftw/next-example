
export async function register() {
  if (isServer()) {
    const { initServices } = await import("./lib/init/container");
    // Initialize the services container before any other code runs
    initServices();
  }
}

const isServer = () => typeof window === "undefined";
