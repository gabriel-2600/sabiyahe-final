const formLogin = document.getElementById('form-login');

formLogin.addEventListener('submit', (event) => {
    // event.preventDefault(); // Prevent the default form submission behavior

    const username = document.getElementById('username-login').value;
    const password = document.getElementById('password-login').value;

    const loginData = {
        username: username,
        password: password,
    };

    fetch('/api/login', {
        method: 'POST',
        body: JSON.stringify(loginData),
        headers: {
            'Content-Type': 'application/json',
        },
    })
    .then(res => {
        if (!res.ok) {
            throw new Error('Network response was not ok');
        }
        return res.json();
    })
    .then(data => {
        const errorLogin = document.getElementById('error-login');
        const successLogin = document.getElementById('success-login');
    
        if (data.status === 'error') {
            successLogin.style.display = 'none';
            errorLogin.style.display = 'block';
            errorLogin.innerText = data.error;
        } else {
            // Redirect to the appropriate home page based on user type
            if (data.user.type === 'admin') {
                // Redirect admin user to the specific URL
                window.location.href = 'http://localhost/sabiyahe-final/index.php';
            } else {
                // Redirect other users based on their type
                const homePage = data.user.type === 'custodian' ? '/custodian' : '/student';
                window.location.href = homePage;
            }
        }
    })
    .catch(error => {
        // Handle errors, including non-JSON responses
        console.error('Error:', error);
    });
});
