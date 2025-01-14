<?php
$host = 'localhost';
$username = 'root';
$password = '';
$dbName = 'sabiyahe-final';

// Create a connection
$conn = new mysqli($host, $username, $password, $dbName);

// Check the connection
if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}

// Get user_id from the GET parameters
$user_id = $_GET['user_id'];

// Delete the user with the specified user_id
$sql = "DELETE FROM users WHERE user_id = $user_id";
if ($conn->query($sql) === TRUE) {
    echo "User deleted successfully";
} else {
    echo "Error deleting user: " . $conn->error;
}

// Close the connection
$conn->close();
?>
