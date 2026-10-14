export default async function handler(req, res) {
  const token = process.env.REPLICATE_API_TOKEN;

  // 1. Replicate par prediction start karo
  const start = await fetch("https://api.replicate.com/v1/predictions", {
    method: "POST",
    headers: {
      "Authorization": `Token ${token}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      version: "f121d640bd286e1fdc8f18bf063830449ac1353e", // Real-ESRGAN 4x
      input: { image: req.body.image, scale: 4, face_enhance: true }
    })
  });

  let prediction = await start.json();

  // 2. Result ka wait karo (polling)
  while (prediction.status!== "succeeded" && prediction.status!== "failed") {
    await new Promise(r => setTimeout(r, 1500));
    const poll = await fetch(`https://api.replicate.com/v1/predictions/${prediction.id}`, {
      headers: { "Authorization": `Token ${token}` }
    });
    prediction = await poll.json();
  }

  res.json(prediction);
}
