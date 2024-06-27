import express from "express";
import * as dotenv from "dotenv";
import Replicate from "replicate";

dotenv.config();

const router = express.Router();

const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN,
});

router.route("/").get((req, res) => {
  res.status(200).json({ message: "Hello from DALL-E!" });
});

router.route("/").post(async (req, res) => {
  try {
    const { prompt } = req.body;

    const aiResponse = await replicate.run(
      "stability-ai/stable-diffusion:ac732df83cea7fff18b8472768c88ad041fa750ff7682a21affe81863cbe77e4",
      {
        input: {
          prompt,
          width: 768,
          height: 768,
          scheduler: "K_EULER",
          num_outputs: 1,
          guidance_scale: 7.5,
          num_inference_steps: 50,
        },
      }
    );

    // Log the entire response to inspect its structure
    console.log("AI Response:", JSON.stringify(aiResponse, null, 2));

    // Adjust based on actual response structure
    const image = aiResponse[0];
    if (image) {
      res.status(200).json({ photo: image });
    } else {
      res.status(500).json({ message: "Failed to generate image" });
    }
  } catch (error) {
    console.error("Error from Replicate API:", error);

    if (error.response) {
      console.error("Error Response Data:", error.response.data);
      console.error("Error Response Status:", error.response.status);
      console.error("Error Response Headers:", error.response.headers);
      res.status(error.response.status).send(error.response.data);
    } else if (error.request) {
      console.error("Error Request Data:", error.request);
      res.status(500).send("No response received from Replicate API");
    } else {
      console.error("Error Message:", error.message);
      res.status(500).send(error.message || "Something went wrong");
    }
  }
});

export default router;
