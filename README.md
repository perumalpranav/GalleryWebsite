# GalleryWebsite

My first user-focused website, displaying a picture gallery with vanilla JavaScript. This is also my first true foray into Node.js and server-side JavaScript.

## Hosted on AWS
[Visit the Website](http://myimagegallery.s3-website.us-east-2.amazonaws.com/)

---

## Table of Contents
- [Overview](#overview)
- [Features](#features)
- [Technologies Used](#technologies-used)
- [Architecture](#architecture)
- [Setup Instructions](#setup-instructions)
- [Usage](#usage)
- [Future Enhancements](#future-enhancements)

---

## Overview
GalleryWebsite is an interactive and dynamic image gallery website. It enables users to view, search, and manage images along with their descriptions and associated keywords. This project integrates frontend and backend development, showcasing effective use of AWS services.

---

## Features
1. **Homepage Display**:
   - An image roller rotates through all available images.
   - A text roller displays keywords users can search by.
   - A search bar allows users to find images using keywords.

2. **Search Functionality**:
   - Entering a keyword redirects to a search results page (`search.html`).
   - Displays all images associated with the entered keyword.

3. **Image Overlay and Editing**:
   - Clicking an image opens an overlay allowing users to:
     - Edit the image's description.
     - Add or remove keywords.
   - Changes are updated in real-time in the database.

4. **Dynamic Data Storage**:
   - Backend integration ensures keyword and description updates are saved and reflected across all users.

---

## Technologies Used
- **Frontend**: HTML, CSS, JavaScript
- **Backend**: Node.js, AWS Lambda
- **API Management**: AWS API Gateway
- **Database**: DynamoDB
- **HTTP Requests**: Axios
- **Hosting**: AWS S3

---

## Architecture
1. **Frontend**:
   - Static files hosted on AWS S3.
   - Dynamic and responsive user interface powered by HTML, CSS, and JavaScript.

2. **Backend**:
   - Custom HTTP API managed by AWS API Gateway.
   - Four AWS Lambda functions handle different API endpoints:
     - Fetch all images.
     - Search images by keyword.
     - Update image descriptions.
     - Modify image keywords.

3. **Database**:
   - DynamoDB stores image metadata, including descriptions and keywords.
   - Real-time updates ensure seamless synchronization.

---

## Usage
1. Navigate to the [hosted website](http://myimagegallery.s3-website.us-east-2.amazonaws.com/).
2. Use the image roller and text roller to browse images and keywords.
3. Search for images by entering a keyword in the search bar.
4. Click on an image in the search results to edit its description or keywords.
5. Enjoy the seamless user experience enabled by dynamic backend integration.

---

## Future Enhancements
- Add user authentication to enable personalized galleries.
- Enhance keyword suggestions with AI-based tagging.
- Add support for uploading new images through the interface.
- Optimize for mobile responsiveness (perhaps a mobile application).
- Create on device image storing for enhanced privacy and security.
- Decrease loading time by simplifying image resolution.

---

## License

This project is licensed under the GNU General Public License v3. See the [LICENSE](LICENSE) file for details. By using this project, you agree to comply with the terms of the GPLv3, ensuring that any derivative works remain open-source and provide the same freedoms to others.

---

## Acknowledgments
- AWS for providing scalable cloud infrastructure.
- Open-source libraries like Axios for simplifying HTTP requests.

