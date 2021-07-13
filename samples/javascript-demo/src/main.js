import CustomersStore from './customers-store';

let customersStore = new CustomersStore();
customersStore.getCustomers().then((customers) => {
    // Get customers via fetch
    alert('Fetch returned ' + customers.length + ' customers');
    // Get customers from store
    customersStore.getCustomers().then((customers) => {
        alert('Store returned ' + customers.length + ' customers');
    });
});