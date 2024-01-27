<?php
if ($_SERVER["REQUEST_METHOD"] == "POST") {
    // Get form data
    $name = $_POST["name"];
    $email = $_POST["email"];
    $phone = $_POST["phone"];
    $message = $_POST["message"];
    $submitterEmail = $_POST["submitterEmail"];
    $submitterPhone = $_POST["submitterPhone"];

    // Email details
    $to = "chysubhash1234@gmail.com"; // Replace with your email address
    $subject = "New Contact Form Submission";
    $headers = "From: $submitterEmail\r\n";
    $headers .= "Reply-To: $submitterEmail\r\n";

    // Compose email content
    $emailContent = "You have received a new contact form submission:\n\n";
    $emailContent .= "Name: $name\n";
    $emailContent .= "Email: $email\n";
    $emailContent .= "Contact Number: $phone\n\n";
    $emailContent .= "Message:\n$message";

    // Send email
    mail($to, $subject, $emailContent, $headers);

    // Redirect to a thank you page or display a success message
    header("Location: thank_you.html"); // Replace with the actual thank you page
    exit();
} else {
    // If the form is not submitted, redirect to the home page or display an error message
    header("Location: index.html"); // Replace with the actual home page or an error page
    exit();
}
?>
