# 🚀 Web Scraping & AI Chatbot Project

## 📌 Overview
This project is a **web scraper** and **AI-powered chatbot** that extracts data from web pages, stores it in **ChromaDB**, and uses **OpenAI's GPT-4o** model to answer user queries based on the extracted content.

## 🛠️ Tech Stack
- **Node.js** 🟢
- **Express.js** 🚀
- **Axios** 🌐
- **Cheerio** 🕷️ (Web Scraping)
- **OpenAI API** 🤖
- **ChromaDB** 🗄️ (Vector Database)
- **Docker & Docker Compose** 🐳 (for ChromaDB)

---

## ⚙️ Features
✅ **Web Scraping**: Extracts page content (head, body, links) using **Cheerio**.

✅ **Vector Embeddings**: Converts text into embeddings using **OpenAI's text-embedding-3-small**.

✅ **ChromaDB Integration**: Stores and retrieves embeddings efficiently.

✅ **Recursive Crawling**: Extracts internal links and follows them for deeper scraping.

✅ **AI-Powered Chatbot**: Answers questions based on scraped data using **GPT-4o**.

✅ **Dockerized ChromaDB**: Runs ChromaDB with **Docker Compose** for easy setup.

---

## 📂 Project Structure
```
📦 project-root
├── 📜 .env                    # Environment variables
├── 📜 docker-compose.yml      # Docker setup for ChromaDB
├── 📜 package.json            # Dependencies & scripts
├── 📜 index.js                # Main application logic
├── 📂 src
│   ├── 🕷️ scraper.js          # Web scraping logic
│   ├── 🤖 chatbot.js         # AI Chatbot implementation
│   ├── 🛢️ database.js       # ChromaDB integration
│   ├── 🔧 utils.js          # Helper functions
```

---

## 🏗️ Setup & Installation
### 🔧 Prerequisites
1. Install **Node.js** (v16+ recommended) 📦
2. Install **Docker & Docker Compose** 🐳

### 🚀 Installation Steps
```sh
# Clone the repository
$ git clone <repo_url>
$ cd <project-folder>

# Install dependencies
$ npm install

# Start ChromaDB with Docker Compose
$ docker-compose up -d

# Create a .env file & add your OpenAI API key
$ echo "OPENAI_API_KEY=your_openai_api_key" > .env

# Run the application
$ node index.js
```

---

## 🎯 Usage
### 🌍 Web Scraping
```js
scrapewebappinfo("https://example.com");
```
### 🤖 AI Chatbot Query
```js
AIChatBot("What is this page about?");
```

---

## 📌 Environment Variables
Create a `.env` file and configure:
```ini
OPENAI_API_KEY=your_openai_api_key
Scrape_URL=https://example.com
CHROMA_DB_HOST=localhost
CHROMA_DB_PORT=8000
```

---

## 🐳 Docker Compose (ChromaDB)
ChromaDB runs in a **Docker container** using `docker-compose.yml`. To start ChromaDB:
```sh
$ docker-compose up -d
```

To stop the service:
```sh
$ docker-compose down
```

---

## 🚀 Future Enhancements
- ✅ **Authentication & Role-based Access** 🔐
- ✅ **Enhanced Caching for Faster Queries** ⚡
- ✅ **Improved Multi-Page Crawling with Sitemap Support** 🌎

---

## 👨‍💻 Author
**SHAKTIVEL ELANGOVAN** ✨  
-🚀 Passionate Developer | AI Enthusiast | FULL STACK DEVELOPER

-📧  Contact:  shaktivel.elangovan2004@gmail.com 

-🔗 LinkedIn: https://www.linkedin.com/in/shaktivel-elangovan/ 

---

## ⭐ Support & Contribution
- Found a bug? 🐞 [Open an issue](#)
- Want to contribute? 🤝 [Submit a PR](#)
- Loved it? ⭐ Star the repo!

🚀 **Happy Coding!**

