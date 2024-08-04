## Initial prompts given

I have created a new T3 app, and I mean to use this app as an example that I will build to show all the patterns I wish for new applications my company creates to follow.

I will have a conversation with you to discuss how it should work, and then we will together make the changes to make it  happen.


Some architectural principals we will follow:
* We will use functional programming style at every point, opting to use closures over classes and ensuring immutability by default
* All access to things external to the application will be done behind interfaces, to allow them to be replaced during testing via dependency injection. This includes the database, external APIs, and even environment variables
* All database access will be behind interfaces that follow the Repository Pattern
* Interfaces following the Service pattern will take these repositories, API clients (abstracted behind interfaces also) etc
* All of these repositories and services will be constructed via the factory pattern, as a function that takes dependencies and returns an object containing functions that use these dependencies via a closure
* Any long running connections (such as a database connection, or a connection to a RabbitMQ broker) will be set up before the application runs, and passed to Repositories and Service factories that require them
 * A the start of the application before anything else runs, we will construct all real instances of the repositiries and services, grouping them into a services container.
* The services container will follow the singleton pattern, and remain throughout the lifetime of the application. The creation of these real versions of the services will happen in call started from the NextJS instrumentation hook, as this is the only code that runs in a NextJS App router application before the router itself.
* All tRPC routers will take this services container as their context argument
* tRPC endpoints will only use these services to interact with the rest of the application. This allows in the tests to inject mock versions of these service interfaces.
* In tests, we will constuct mock/stub implementations of these Repository and Service interfaces using Vitest, allowing us to test each layer of the application in isolation without having to use module mocking at all

I may give further requirements, but these are the base we will work from.

