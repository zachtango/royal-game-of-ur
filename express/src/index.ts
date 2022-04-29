import server from './server';
import dotenv from 'dotenv';

dotenv.config();

// Constants
const serverStartMsg = 'Express server started on port: ',
        port = (process.env.PORT || 9000);

// Start server
server.listen(port, () => {
    console.log(serverStartMsg, port);
});
