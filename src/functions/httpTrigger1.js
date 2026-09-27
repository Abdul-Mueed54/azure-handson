const { app } = require('@azure/functions');

const serviceBusQueue = {
    type: 'serviceBus',
    queueName: 'myqueue',
    connection: 'ServiceBusConnectionString',
};

app.http('httpTrigger1', {
    methods: ['GET', 'POST'],
    authLevel: 'anonymous',
    extraOutputs: [serviceBusQueue],
    handler: async (request, context) => {
        context.log(`Http function processed request for url "${request.url}"`);

        const contentType = request.headers.get('content-type') || '';
        let payload;

        if (contentType.includes('application/json')) {
            payload = await request.json();
        } else {
            payload = request.query.get('name') || (await request.text()) || 'world';
        }

        const message = {
            body: payload,
            sentAt: new Date().toISOString(),
        };

        context.extraOutputs.set(serviceBusQueue, message);
        context.log(`Queued message to Service Bus queue "${serviceBusQueue.queueName}"`);

        return {
            status: 202,
            jsonBody: {
                status: 'accepted',
                queue: serviceBusQueue.queueName,
                message,
            },
        };
    },
});
