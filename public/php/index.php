<?php
// http://localhost/sabiyahe-final/index.php
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

// Fetch user accounts
$sql = "SELECT * FROM users";
$result = $conn->query($sql);

// Start HTML document
echo '<html>';
echo '<head>';
echo '<title>User Accounts</title>';
echo '<link rel="stylesheet" type="text/css" href="admin-style.css">'; // Include your CSS file here
echo '</head>';
echo '<body>';
echo '<h1>User Accounts</h1>';
echo '<table id="accounts-table">';
echo '<thead>';
echo '<th>User ID</th>';
echo '<th>Email</th>';
echo '<th>Username</th>';
echo '<th>Full Name</th>';
echo '<th>Type</th>';
echo '<th>Delete</th>';
echo '</thead>';
echo '<tbody id="accounts-tbody">';

if ($result->num_rows > 0) {
    while ($row = $result->fetch_assoc()) {
        echo '<tr>';
        echo '<td>' . $row['user_id'] . '</td>';
        echo '<td>' . $row['email'] . '</td>';
        echo '<td>' . $row['username'] . '</td>';
        echo '<td>' . $row['full_name'] . '</td>';
        echo '<td>' . $row['type'] . '</td>';
        echo '<td><button onclick="deleteUser(' . $row['user_id'] . ')">Delete</button></td>';
        echo '</tr>';
    }
} else {
    echo '<tr><td colspan="4">No user accounts found</td></tr>';
}

echo '</tbody>';
echo '</table>';
echo '</body>';
echo '</html>';

// Close the connection
$conn->close();
?>

<script>
function deleteUser(userId) {
    if (confirm('Are you sure you want to delete this user?')) {
        // Send an AJAX request to delete the user
        var xhr = new XMLHttpRequest();
        xhr.onreadystatechange = function () {
            if (xhr.readyState == 4 && xhr.status == 200) {
                // Reload the page or update the table as needed
                location.reload();
            }
        };
        // Update the path to delete_user.php based on your folder structure
        xhr.open('GET', 'delete_user.php?user_id=' + userId, true);
        xhr.send();
    }
}
</script>
