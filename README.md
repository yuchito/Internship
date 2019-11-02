# Restful API
Building a Restful API using **Node.js**, combined with **Express** server, I could create lightweight, fast, scalable API quickly and simply. 
A web based API which interacts with **Mirth Connect API** and **PostgreSQL**


## Requirements
- [Node & npm](https://nodejs.org/en/)
- [Git](https://www.robinwieruch.de/git-essential-commands)
- [Mirth Connect Server](https://www.nextgen.com/products-and-services/NextGen-Connect-Integration-Engine-Downloads)
- [HL7 V2.x Message Profiling informative document](https://www.hl7.org/implement/standards/product_brief.cfm?product_id=244)
- [pgAdmin 4](https://www.pgadmin.org/download/)
- [Postman](https://www.getpostman.com/)



-  [Mirth API Documentation](https://bridge.nextgen.com/media/3244/NextGen%20Connect%203.7%20User%20Guide.pdf)


## API Endpoints
Express middleware to serve `/index`, `/systems`, `/facilities/:systemName` and `/messages` endpoints.
### Tests

- Install **Postman** to interact with REST API
-   Create a message with:
    -   URL:  [http://localhost:3000/](http://localhost:3000/)
    -   Method: GET
    -   Body: raw + JSON (application/json)
    -   Body Content:  `{ "text": "Hi again, World" }`
    
### Status

- `200 OK`
- `503 Service Unavailable`
- `401 Unauthorized`
- `404 Not Found`

### Routes

- GoodToGo ( `/index` )
Emitting a  `200 OK`  response if the application should be considered healthy, and  `503 Service Unavailable`  if it should not. This is intended to be used to make routing decisions.

Always returns  `200 OK`  unless a  `goodToGoTest`  option is specified.

- External systems (`/systems` )
Return a JSON object which contains the systems and messages received/sent
- Facilities of each external system (`/facilities/:systemName` )
Return a JSON object containing facilities of each external system with the ACK/NACK 
- Last received/sent message of each system  (`/messages/:systemName` )
Return the date:time of the last receive/sent messages of system
