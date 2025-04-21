This application is built using a modular microservice-based architecture. Each key feature is served by a dedicated backend service, and all services interact with the frontend through RESTful API calls. Integration is handled using standard HTTP methods such as GET, POST, PUT, and DELETE via Axios on the frontend. During development, local services are exposed using Bore tunnels to allow access between independently running services.

List of Integrated Microservices

1. Calendar Service
2. Request Service
3. Department Announcement Service
4. Budget Management Service
5. Event Announcement Service
6. Venue Management Service
   
Each of these services is hosted independently and integrated in the frontend by pointing API calls to their Bore-exposed URLs. 
