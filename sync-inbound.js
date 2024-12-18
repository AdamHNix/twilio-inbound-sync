

exports.handler = async function(context, event, callback) {

    const client = context.getTwilioClient();

    serviceSid = context.SYNC_SERVICE_SID

     // Fetch an existing Sync List
    async function fetchSyncList(name, serviceSid) {
        try {
            const syncList = await client.sync.v1
                .services(serviceSid)
                .syncLists(name)
                .fetch();
            console.log("Sync List", syncList);
            return syncList;
        } catch (error) {
            if (error.status === 404) {
                console.log("No Sync List");
                return null;
            }
            throw error;
        }
    }

    // Create a new Sync List
    async function createSyncList(name, serviceSid) {
        try {
            const syncList = await client.sync.v1
                .services(serviceSid)
                .syncLists.create({
                    uniqueName: name,
                });
            console.log("Created Sync List SID:", syncList);
            return syncList;
        } catch (error) {
            console.error("Error creating Sync List:", error);
            throw error;
        }
    }

    // Add an item to the Sync List
    async function createSyncListItem(name, serviceSid, data) {
        try {
            const syncListItem = await client.sync.v1
                .services(serviceSid)
                .syncLists(name)
                .syncListItems.create({
                    data: data,
                });
            console.log("Created Sync List Item Index:", syncListItem.index);
            return syncListItem;
        } catch (error) {
            console.error("Error adding item to Sync List:", error);
            throw error;
        }
    }
    
    console.log("Event object:", event);

    const {AccountSid , OptOutType} = event

    if(OptOutType){
        try {
            const listName = `optOut-${AccountSid}`;
            let list = await fetchSyncList(listName, serviceSid);

            if (!list) {
                console.log("Sync List does not exist. Creating...");
                list = await createSyncList(listName, serviceSid);
            }

            console.log("Adding item to Sync List...");
            await createSyncListItem(listName, serviceSid, event);

            callback(null, "ok");
        } catch (err) {
            console.error("Error:", err);
            callback(err);
        }
    }
    const response = new Twilio.Response();
    
    response.appendHeader('Content-Type', 'text/plain');
    response.setBody("This number is not being monitored");

    callback(null, response);
};