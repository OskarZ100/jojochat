document.querySelector('form').addEventListener('submit', function(event) {
    event.preventDefault(); // Stops page reload
    let username = document.getElementById('welcome-name').value;
    console.log("Username entered:", username); // Test it
});