## How to Run iMovies Locally

### 1. Clone the Repository
```bash
git clone [https://github.com/](https://github.com/)<YOUR_GITHUB_USERNAME>/imovies.git
cd imovies
cd Code

# Via local system service (Linux)
sudo systemctl start mongodb

# Or via Docker
sudo docker start imovies-mongo || sudo docker run -d --name imovies-mongo -p 27017:27017 mongo:latest

//to run the backend server
cd server
npm install
cp .env.example .env
npm run dev

//to run the frotend client architecture
cd client
npm install --legacy-peer-deps
npm run dev