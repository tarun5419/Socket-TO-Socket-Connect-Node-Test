// Importing the 'hostname' module and getting the 'hostname' value from it
const hostnameFromFile = require("./hostname").hostname;

// Object containing different deployment configurations
const deployments = {
  informal: {
    url: "mongodb://localhost:27017", // MongoDB URL for the 'informal' deployment
    name: "deletabledb", // Name of the database for the 'informal' deployment
    prefix: "i", // Prefix value for the 'informal' deployment
    clientServerUrl: "http://localhost:3000", // Client-server URL for the 'informal' deployment
  },
  alpha: {
    url: "mongodb://mfrmongoadminuser:qO4hzYWnTipGqyQz@cluster1-shard-00-00.bpp3o.mongodb.net:27017,cluster1-shard-00-01.bpp3o.mongodb.net:27017,cluster1-shard-00-02.bpp3o.mongodb.net:27017/alphaCluster?replicaSet=atlas-biufjf-shard-0&ssl=true&authSource=admin", // MongoDB URL for the 'alpha' deployment
    prefix: "a", // Prefix value for the 'alpha' deployment
    clientServerUrl: "https://mfmalpha.mediaferry.com", // Client-server URL for the 'alpha' deployment
    clientServerUrlNew: "https://mfmqa.mediaferry.com", // New client-server URL for the 'alpha' deployment
    // Mfmt URL for the 'alpha' deployment
  },
  uat: {
    url: "mongodb://mfrmongoadminuser:qO4hzYWnTipGqyQz@cluster0-shard-00-00-bpp3o.mongodb.net:27017,cluster0-shard-00-01-bpp3o.mongodb.net:27017,cluster0-shard-00-02-bpp3o.mongodb.net:27017/newBeta?replicaSet=Cluster0-shard-0&ssl=true&authSource=admin", // MongoDB URL for the 'beta' deployment
    clientServerUrl: "https://mfmuat.mediaferry.com", // Client-server URL for the 'beta' deployment
    clientServerUrlNew: "https://mfmuat.mediaferry.com", // New client-server URL for the 'beta' deployment
    mfmtUrl: "https://rohapi2.mediaferry.com/", 
  },
  prod: {
    url: "mongodb+srv://mfmProdAdminuser:T5Y7N1y2Vo7JidEQ@prod.bpp3o.mongodb.net/MFMProdDB?retryWrites=true&w=majority", // MongoDB URL for the 'prod' deployment
    prefix: "m", // Prefix value for the 'prod' deployment
    clientServerUrl: "https://mfm.mediaferry.com", // Client-server URL for the 'prod' deployment
    clientServerUrlNew: "https://mfm.mediaferry.com", // New client-server URL for the 'prod' deployment
    mfmtUrl: "https://rohapi1.mediaferry.com/",
  },

};

// Getting the deployment configuration based on the hostname value from the 'hostname' module
const deployment = deployments[hostnameFromFile] || {};

// Exporting the configuration object with various properties
module.exports = {
  // Determines if the environment is 'development' or not (based on the 'NODE_ENV' variable or hostname value)
  development: process.env.NODE_ENV === "development" || hostnameFromFile === "alpha" || hostnameFromFile === "develop",
  // Determines if the environment is 'production' or not
  production: !(process.env.NODE_ENV === "development" || hostnameFromFile === "alpha" || hostnameFromFile === "develop"),
  // MongoDB URL for the current deployment (or empty string if not found)
  development_db_url: deployment.url || "",
  // Name of the MongoDB database for the current deployment (or empty string if not found)
  development_db_name: deployment.name || "",
  // Prefix value for the current deployment (or empty string if not found)
  prefix: deployment.prefix || "",
  informalRemote: false,
  // The hostname value from the 'hostname' module
  hostnameFromFile,
  // Client-server URL for the current deployment
  clientServerUrl: deployment.clientServerUrl,
  // New client-server URL for the current deployment
  clientServerUrlNew: deployment.clientServerUrlNew,

  // The port number for the main server (or 3010 if not specified in the environment variable)
  mainPort: process.env.PORT || 3020,
  enableCorsInsecurely: false,
};