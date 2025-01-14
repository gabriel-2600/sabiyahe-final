HOW TO SET UP THE PROJECT

Node.js
1. Install one of the latest version of Node.js

2. In your IDE terminal, install the following using npm: cookie-parser, cors, 
   dotenv, ejs, express, js-cookie, jsonwebtoken, mysql, mysql2, nodemon

3. Open your WAMP/XAMP/MAMP and go to localhost/phpmyadmin in your browser

4. Import our database 'sabiyahe-final.sql' (can be found in utilities folder in the project folder) 
   in localhost/phpmyadmin

5. Go back to your IDE terminal and type: 'nodemon' to run the server

6. For student modules, here is the URL: localhost:5000/student
   For custodian modules, here is the URL: 
   


PHP
1.  Make sure WampServer is running. You can start it by clicking on the 
    WampServer icon in the system tray and selecting "Start All Services"

2. Navigate to the directory where WampServer is installed on your computer. 
   This is typically something like C:\wamp64\ or C:\wamp\

3. Inside the WampServer installation directory, you should find a directory named www or public_html. 
   This is the directory where the web server looks for files to serve

4. Inside the www or public_html directory, create a new directory for your project. Let's name it sabiyahe-final. 
   You can do this by right-clicking and selecting "New" -> "Folder"

5. Copy/Move the index.php and delete_user.php (can be found in public/php folder in project folder) 
   files into the sabiyahe-final directory

6. Once the files are in place, you should be able to access them through your web browser. 
   If WampServer is running on localhost, you can access your 
   PHP files by going to: http://localhost/sabiyahe-final/index.php