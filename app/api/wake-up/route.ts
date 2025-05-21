export const dynamic = "force-dynamic";


export async function GET() {
  let data = "";
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

    data = await response.json();

    if (!response.ok) {
      return Response.json({ isActive: false, data });
    }

    return Response.json({ isActive: true, data });
  } catch (error) {
    if (error instanceof Error) {
      console.log("error.stack is ", error.stack);
      console.log("error.message is ", error.message);
    }
    return Response.json({ isActive: false, data });
  }
}
