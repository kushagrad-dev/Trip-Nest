# Trip-Nest

> A full-stack Airbnb-inspired vacation rental platform where users can discover, list, and review unique stays around the world.

---

## Overview

Trip-Nest is a full-stack web application built with **Node.js**, **Express**, and **MongoDB** that replicates the core functionality of Airbnb. Users can browse listings, create their own properties, upload photos, leave reviews, and manage their accounts — all within a clean, responsive interface.

---

##  Features

- **User Authentication** — Secure sign-up, login, and logout with session management
- **Listings** — Create, read, update, and delete vacation property listings
- **Image Uploads** — Upload and manage listing photos via **Cloudinary**
- **Reviews** — Authenticated users can post and delete reviews on listings
- **Authorization** — Only listing/review owners can edit or delete their content
- **Input Validation** — Server-side validation using **Joi** schemas
- **Interactive Maps** — Location display powered by the Mapbox API
- **Responsive UI** — Built with Bootstrap and custom CSS for a clean, mobile-friendly experience
- **Flash Messages** — Real-time success and error notifications

---

## Tech Stack

| Layer | Technology |
|---|---|
| Runtime | Node.js |
| Framework | Express.js |
| Templating | EJS + EJS-Mate |
| Database | MongoDB + Mongoose |
| Authentication | Passport.js (Local Strategy) |
| Image Storage | Cloudinary + Multer |
| Validation | Joi |
| Styling | Bootstrap 5 + Custom CSS |
| Maps | Mapbox GL JS |
| Session Store | connect-mongo |

---

##  Project Structure

```
Trip-Nest/
├── controllers/        # Route handler logic (MVC controllers)
├── models/             # Mongoose schemas (User, Listing, Review)
├── routes/             # Express routers
├── views/              # EJS templates
│   ├── listings/       # Listing pages (index, show, new, edit)
│   ├── reviews/        # Review partials
│   ├── users/          # Login & signup pages
│   └── layouts/        # Boilerplate layout
├── public/             # Static assets (CSS, JS, images)
├── utils/              # Custom error handler & async wrapper
├── init/               # Database seed data
├── uploads/            # Temporary local file uploads
├── middleware.js        # Custom middleware (auth, validation)
├── schema.js           # Joi validation schemas
├── cloudConfig.js      # Cloudinary configuration
└── app.js              # Express app entry point
```

---

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v14 or higher)
- [MongoDB](https://www.mongodb.com/) (local or Atlas)
- A [Cloudinary](https://cloudinary.com/) account
- A [Mapbox](https://www.mapbox.com/) account

### Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/kushagrad-dev/Trip-Nest.git
   cd Trip-Nest
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Set up environment variables**

   Create a `.env` file in the root directory:

   ```env
   ATLASDB_URL=your_mongodb_connection_string
   SECRET=your_session_secret

   CLOUD_NAME=your_cloudinary_cloud_name
   CLOUD_API_KEY=your_cloudinary_api_key
   CLOUD_API_SECRET=your_cloudinary_api_secret

   MAP_TOKEN=your_mapbox_access_token
   ```

4. **Seed the database** 

   ```bash
   node init/index.js
   ```

5. **Start the server**

   ```bash
   node app.js
   ```

6. Open your browser and navigate to `http://localhost:8080`

---

## Usage

- **Browse** all available listings on the home page
- **Sign up** for an account to unlock full features
- **Create a listing** with a title, description, location, price, and photos
- **Leave reviews** on listings you've visited
- **Edit or delete** your own listings and reviews from their detail pages

---

## Environment Variables Reference

| Variable | Description |
|---|---|
| `ATLASDB_URL` | MongoDB connection URI |
| `SECRET` | Session secret key |
| `CLOUD_NAME` | Cloudinary cloud name |
| `CLOUD_API_KEY` | Cloudinary API key |
| `CLOUD_API_SECRET` | Cloudinary API secret |
| `MAP_TOKEN` | Mapbox public access token |

---

##  Contributing

Contributions are welcome! Feel free to open issues or submit pull requests.

1. Fork the repository
2. Create your feature branch: `git checkout -b feature/my-feature`
3. Commit your changes: `git commit -m 'Add my feature'`
4. Push to the branch: `git push origin feature/my-feature`
5. Open a pull request

---

##  License

This project is open source and available under the [MIT License](LICENSE).

---

<p align="center">Made with ❤️ by <a href="https://github.com/kushagrad-dev">kushagrad-dev</a></p>
