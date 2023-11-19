//Function to handle the click event for the Add button
document.getElementById("addButton").addEventListener("click", () => {
    window.location.href = '/add';
});

// //Function to handle the change event for the Filter button
document.getElementById("filterSelect").addEventListener("change", () => {
    document.getElementById("filterForm").submit();
});