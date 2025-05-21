export async function GET() {
  try {
    const EXPRESS_API_URL = process.env.EXPRESS_API_URL;
    if (!EXPRESS_API_URL) {
      throw new Error("EXPRESS_API_URL is not defined");
    }
    if (process.env.ENV === "development") {
      console.log("In development mode, skipping wake-up check");
      return Response.json({ isActive: true });
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 40000);

    const response = await fetch(EXPRESS_API_URL, {
      method: "GET",
      signal: controller.signal,
    });

    clearTimeout(timeout);

    const data = await response.json();
    console.log("data is ", data);

    if (!response.ok) {
      return Response.json({ isActive: false });
    }

    return Response.json({ isActive: true,data });
  } catch (error) {
    if (error instanceof Error) {
      console.log("error.stack is ", error.stack);
      console.log("error.message is ", error.message);
    }
    return Response.json({ isActive: false });
  }
}
