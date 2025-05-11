import dbConnect from "@/lib/dbConnect";
import Customization from "@/models/Customization";

export default async function handler(req, res) {
  const {
    query: { chatbotId },
    method,
  } = req;

  await dbConnect();

  if (method === "GET") {
    try {
      const customization = await Customization.findOne({ chatbotId });

      if (!customization) {
        return res.status(404).json({ error: "Customization not found" });
      }

      res.status(200).json(customization);
    } catch (error) {
      res.status(500).json({ error: "Server error" });
    }
  } else {
    res.setHeader("Allow", ["GET"]);
    res.status(405).end(`Method ${method} Not Allowed`);
  }
}
