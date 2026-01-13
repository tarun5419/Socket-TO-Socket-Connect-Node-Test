import { Component } from '@angular/core';

@Component({
  selector: 'app-indexdb',
  standalone: true,
  imports: [],
  templateUrl: './indexdb.component.html',
  styleUrl: './indexdb.component.scss'
})
export class IndexdbComponent {
  db: any;
  request: any
  objectStore: any



  // createIDb() {

  //   this.request = indexedDB.open("MyTestDatabase");

  //   this.request.onerror = (event: any) => {
  //     console.error("Why didn't you allow my web app to use IndexedDB?!", event);
  //   };

  //   this.request.onsuccess = (event: any) => {
  //     this.db = event.target.result;
  //     console.log(this.db, "onsuccess");

  //   };

  //   // this.db.onerror = (event: any) => {
  //   //   console.error(`Database error: ${event.target.error?.message}`);
  //   // };
  // }

  // updatingVersion() {
  //   this.request.onupgradeneeded = (event: any) => {
  //     const db = event.target.result;
  //     const objectStore = db.createObjectStore("name", { keyPath: "myKey" });
  //   };
  // }


  customerData = [
    { ssn: "444-44-4444", name: "Bill", age: 35, email: "bill@company.com" },
    { ssn: "555-55-5555", name: "Donna", age: 32, email: "donna@home.org" },
  ];


  newDbCreate() {
    const dbName = "the_name";
    const request = indexedDB.open(dbName, 2);
    request.onerror = (event) => {
      console.log(event)
    };

    request.onsuccess = (event: any) => {
      this.db = event.target.result;
      console.log(this.db, "onsuccess");

    };

    request.onupgradeneeded = (event: any) => {
      const db = event.target.result;
      const objectStore = db.createObjectStore("customers", { keyPath: "ssn" });

      // objectStore.createIndex("name", "name", { unique: false });

      // objectStore.createIndex("email", "email", { unique: true });

      objectStore.transaction.oncomplete = (event: any) => {
        const customerObjectStore = db
          .transaction("customers", "readwrite")
          .objectStore("customers");
        this.customerData.forEach((customer: any) => {
          customerObjectStore.add(customer);
        });
      };
    };

  }



  makeDb() {
    const dbName = "New Notifications";
    const request = indexedDB.open(dbName, 2);
    request.onerror = (event) => {
      console.log(event)
    };

    request.onsuccess = (event: any) => {
      this.db = event.target.result;
      console.log(this.db, "onsuccess");

    };

    request.onupgradeneeded = (event: any) => {
      this.db = event.target.result;
      this.objectStore = this.db.createObjectStore("customers", { keyPath: "ssn" });
        // Create index on 'email' field (non-unique)
        this.objectStore.createIndex("email", "email", { unique: true });
      console.log(this.objectStore,"this.objectStore");
      
    };
  }

  // storeDataInDb(){
  //     // this.objectStore = this.db.createObjectStore("customers", { keyPath: "ssn" });

  //     this.objectStore.transaction.oncomplete = (event: any) => {
  //       const customerObjectStore = this.db.transaction("customers", "readwrite").objectStore("customers");
  //       this.customerData.forEach((customer: any) => {
  //         customerObjectStore.add(customer);
  //       });
  //     };
  // }

  storeDataInDb() {
    // Example customer data
    // this.customerData = [
    //   { ssn: "123-45-6789", name: "John Doe", email: "john.doe@example.com" },
    //   { ssn: "987-65-4321", name: "Jane Smith", email: "jane.smith@example.com" },
    // ];
  
    // Create a transaction for storing data
    const transaction = this.db.transaction("customers", "readwrite");
    const objectStore = transaction.objectStore("customers");
  
    // Add each customer to the object store
    this.customerData.forEach((customer: any) => {
      const request = objectStore.add(customer);
      request.onsuccess = () => {
        console.log(`Customer with SSN ${customer.ssn} added successfully`);
      };
      request.onerror = (event: any) => {
        console.log(`Error adding customer with SSN ${customer.ssn}`, event);
      };
    });
  
    transaction.oncomplete = () => {
      console.log("All customer data added successfully");
    };
  
    transaction.onerror = (event: any) => {
      console.log("Error during transaction", event);
    };
  }

  makeindexing() {
    this.objectStore.createIndex("name", "name", { unique: false });

    this.objectStore.createIndex("email", "email", { unique: true });
  }

  makeCollection() {
    this.objectStore = this.db.createObjectStore("customers", { keyPath: "ssn" });
  }

  removedataFromDb() {
    const request = this.db
      .transaction(["customers"], "readwrite")
      .objectStore("customers")
      .delete("444-44-4444");
    request.onsuccess = (event: any) => {
      // It's gone!
      console.log("successFully removed data");

    };
  }


  gettingDataFromDb() {
    const transaction = this.db.transaction(["customers"]);
    const objectStore = transaction.objectStore("customers");
    const request = objectStore.get("444-44-4444");
    request.onerror = (event: any) => {
      console.log("getting data erro ", event);

    };
    request.onsuccess = (event: any) => {
      console.log(`Name for SSN 444-44-4444 is ${request.result.name}`);
    };
  }


  deleteDb() {
    const dbName = "New Notifications";
    const request = indexedDB.deleteDatabase(dbName);
  
    request.onsuccess = () => {
      console.log(`Database "${dbName}" deleted successfully.`);
    };
  
    request.onerror = (event) => {
      console.error("Error deleting database:", event);
    };
  
    request.onblocked = () => {
      console.warn("Database deletion is blocked. Close all open connections to proceed.");
    };
  }


  connectWithExistingDb(){
    const dbName = "New Notifications"; // Name of the existing database
    const request = indexedDB.open(dbName);
  
    request.onerror = (event) => {
      console.log("Database connection failed:", event);
    };
  
    request.onsuccess = (event: any) => {
      this.db = event.target.result; // Save the database instance
      console.log("Connected to database:", this.db);
  
      // You can now call methods to interact with the database
      // this.getCustomersData(); // Example: Fetch data from "customers" store
    };
  }

  getCustomersData() {
    // Check if the database is connected
    if (!this.db) {
      console.error("Database is not connected. Call connectWithExistingDb() first.");
      return;
    }
  
    // Check if the "customers" object store exists
    if (!this.db.objectStoreNames.contains("customers")) {
      console.error("Object store 'customers' does not exist.");
      return;
    }
  
    // Create a transaction for reading data
    const transaction = this.db.transaction("customers", "readonly");
    const objectStore = transaction.objectStore("customers");
  
    // Open a cursor to iterate through all records in the object store
    const request = objectStore.openCursor();
    
    const allCustomerData: any[] = []; // Array to collect all customer data
  
    request.onsuccess = (event: any) => {
      const cursor = event.target.result;
  
      if (cursor) {
        allCustomerData.push(cursor.value); // Add each customer record to the array
        cursor.continue(); // Move to the next record
      } else {
        // After all records are retrieved, log them all at once
        console.log("All customer data:", allCustomerData);
      }
    };
  
    request.onerror = (event: any) => {
      console.log("Error retrieving customer data:", event);
    };
  }




  insertDataIntoDb() {
    // Check if the database is connected
    if (!this.db) {
      console.error("Database is not connected. Call connectWithExistingDb() first.");
      return;
    }
  
    // Check if the "customers" object store exists
    if (!this.db.objectStoreNames.contains("customers")) {
      console.error("Object store 'customers' does not exist.");
      return;
    }
  
    // Define the data you want to insert
    const newCustomer = {
      ssn: '123-45-6789',
      name: 'Bill',
      email: 'bill@example.com'
    };
  
    // Create a transaction for writing data
    const transaction = this.db.transaction("customers", "readwrite");
    const objectStore = transaction.objectStore("customers");
  
    // Add the new customer data to the object store
    const request = objectStore.add(newCustomer);
  
    request.onsuccess = (event: any) => {
      console.log("Customer data inserted successfully:", newCustomer);
    };
  
    request.onerror = (event: any) => {
      console.error("Error inserting customer data:", event);
    };
  }



  updateDataIntoDb() {
    // Check if the database is connected
    if (!this.db) {
      console.error("Database is not connected. Call connectWithExistingDb() first.");
      return;
    }
  
    // Check if the "customers" object store exists
    if (!this.db.objectStoreNames.contains("customers")) {
      console.error("Object store 'customers' does not exist.");
      return;
    }
  
    // Define the data you want to insert or update (replace if SSN exists)
    const newCustomer = {
      ssn: '444-44-4444', // The SSN to match (or replace)
      name: 'Bill',
      email: 'bill@example.com'
    };
  
    // Create a transaction for writing data
    const transaction = this.db.transaction("customers", "readwrite");
    const objectStore = transaction.objectStore("customers");
  
    // Use 'put()' to insert or update the data
    const request = objectStore.put(newCustomer);
  
    request.onsuccess = (event: any) => {
      console.log("Customer data inserted or updated successfully:", newCustomer);
    };
  
    request.onerror = (event: any) => {
      console.error("Error inserting or updating customer data:", event);
    };
  }
  
  getCustomerDataBySSN() {
    // Check if the database is connected
    if (!this.db) {
      console.error("Database is not connected. Call connectWithExistingDb() first.");
      return;
    }
  
    // Check if the "customers" object store exists
    if (!this.db.objectStoreNames.contains("customers")) {
      console.error("Object store 'customers' does not exist.");
      return;
    }
  
    // Create a transaction for reading data
    const transaction = this.db.transaction("customers", "readonly");
    const objectStore = transaction.objectStore("customers");
  
    // Get the customer data using the SSN (key)
    const request = objectStore.get("444-44-4444");
  
    request.onsuccess = (event: any) => {
      if (request.result) {
        console.log("Customer data found:", request.result); // Log the found customer data
      } else {
        console.log(`No customer found with SSN ${"444-44-4444"}`);
      }
    };
  
    request.onerror = (event: any) => {
      console.error("Error retrieving customer data:", event);
    };
  }


  getDataWithEmail(){
      // Check if the database is connected
      if (!this.db) {
        console.error("Database is not connected. Call connectWithExistingDb() first.");
        return;
      }
    
      // Check if the "customers" object store exists
      if (!this.db.objectStoreNames.contains("customers")) {
        console.error("Object store 'customers' does not exist.");
        return;
      }
    
      // Create a transaction for reading data
      const transaction = this.db.transaction("customers", "readonly");
      const objectStore = transaction.objectStore("customers");
    
      // Access the index on 'email'
      const emailIndex = objectStore.index("email");
    
      // Get the customer data using the email
      const request = emailIndex.get("bill@example.com");
    
      request.onsuccess = (event: any) => {
        if (request.result) {
          console.log("Customer data found:", request.result); // Log the found customer data
        } else {
          console.log(`No customer found with email ${"bill@example.com"}`);
        }
      };
    
      request.onerror = (event: any) => {
        console.error("Error retrieving customer data by email:", event);
      };
    
  }
  
  
}
