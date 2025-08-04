//to run neo4j 

import neo4j from 'neo4j-driver'
import dotenv from "dotenv"


dotenv.config()

//retreving neo4j cred

const neo4JURI = process.env.NEO4J_CONNECTION_URI
const neo4jUSER = process.env.NEO4J_USERNAME || 'neo4j'
const neo4jPASSWORD = process.env.NEO4J_PASSWORD


if(!neo4jPASSWORD || !neo4JURI){
    console.error('Neo4j credetinals are wrong, check again');
    process.exit(1)
    
}


const driver = neo4j.driver(neo4JURI, neo4j.auth.basic(neo4jUSER, neo4jPASSWORD), {
    connectionTimeout: 30000,
})

//verifying neo4j connection

driver.getServerInfo()
    .then(() => {
        console.log('Neo4j connected successfully');
    })
    .catch(error => {
        console.error('Neo4j connection error', error.message);
        process.exit(1);
        
    })


//to acquire new session from cypher queires in neo4j

const getNeo4jSession = () => {
    return driver.session({database: 'neo4j', defaultAccessMode: neo4j.session.WRITE})
}


export {driver, getNeo4jSession}