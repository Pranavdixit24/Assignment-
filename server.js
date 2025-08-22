const http = require("http");
const https = require("https");

const PORT = 8000;
const TIME_URL = "https://time.com";

http.createServer((req, res) => {
  if (req.url === "/getTimeStories") {
    https.get(TIME_URL, (response) => {
      let data = "";
      response.on("data", (chunk) => (data += chunk));
      response.on("end", () => {
        let stories = [];

        
        const sectionMatch = data.match(
          /<ul class="latest-stories__list">([\s\S]*?)<\/ul>/
        );

        if (sectionMatch) {
          const section = sectionMatch[1];
          const regex = /<a[^>]+href="([^"]+)"[^>]*>\s*<h3[^>]*>(.*?)<\/h3>/g;

          let match;
          while ((match = regex.exec(section)) !== null && stories.length < 6) {
            let link = match[1].startsWith("http")
              ? match[1]
              : "https://time.com" + match[1];
            let title = match[2].replace(/<[^>]+>/g, "").trim();
            if (title) stories.push({ title, link });
          }
        }

        if (stories.length === 0) {
          const regex = /<h3[^>]*>(.*?)<\/h3>/g;
          let match;
          while ((match = regex.exec(data)) !== null && stories.length < 6) {
            let title = match[1].replace(/<[^>]+>/g, "").trim();
            if (title) stories.push({ title, link: TIME_URL });
          }
        }

        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(JSON.stringify(stories, null, 2));
      });
    }).on("error", (err) => {
      res.writeHead(500);
      res.end(JSON.stringify({ error: err.message }));
    });
  } else {
    res.writeHead(404);
    res.end("Not Found");
  }
}).listen(PORT, () => {
  console.log(` Server running at http://localhost:${PORT}/getTimeStories`);
});
