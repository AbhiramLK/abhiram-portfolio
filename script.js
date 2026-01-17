/*
    script.js - The JavaScript File
    
    JavaScript adds interactivity to your website. While HTML structures content
    and CSS styles it, JavaScript makes things happen when users interact with
    the page (like clicking buttons, scrolling, or submitting forms).
    
    This file is minimal for now - just smooth scrolling for navigation links.
    
    Comments in JavaScript use // for single lines or /* ... */ for blocks.
*/

// Wait for the page to fully load before running JavaScript
document.addEventListener('DOMContentLoaded', function() {
    /*
        document.addEventListener listens for events.
        'DOMContentLoaded' means "when the HTML is fully loaded".
        This ensures all HTML elements exist before we try to use them.
        
        function() { ... } is called a "callback function" - it runs
        when the event happens.
    */

    // Get all navigation links
    const navLinks = document.querySelectorAll('.nav-links a');
    /*
        document.querySelectorAll finds all elements matching the selector.
        '.nav-links a' means "all <a> tags inside elements with class 'nav-links'".
        
        const creates a variable that can't be changed after it's set.
    */

    // Add a click event listener to each navigation link
    navLinks.forEach(function(link) {
        /*
            forEach loops through each link in the navLinks collection.
            For each link, we run the function inside.
        */
        link.addEventListener('click', function(e) {
            /*
                e is the event object - it contains information about the click.
            */
            // Get the href attribute (like "#home" or "#about")
            const href = link.getAttribute('href');
            /*
                getAttribute gets an attribute value from the HTML element.
                For example, if the HTML is <a href="#home">, this gets "#home".
            */

            // Only do smooth scrolling if it's a hash link (starts with #)
            if (href.startsWith('#')) {
                e.preventDefault();
                /*
                    preventDefault() stops the default behavior.
                    By default, clicking a # link jumps instantly.
                    We're preventing that so we can scroll smoothly instead.
                */

                // Get the target section element
                const targetId = href.substring(1);
                /*
                    substring(1) removes the '#' character.
                    "#home" becomes "home".
                */
                const targetSection = document.getElementById(targetId);
                /*
                    document.getElementById finds an element by its id.
                    For example, document.getElementById('home') finds
                    the element with id="home" in the HTML.
                */

                // If the target section exists, scroll to it smoothly
                if (targetSection) {
                    targetSection.scrollIntoView({
                        behavior: 'smooth',
                        /*
                            behavior: 'smooth' makes the scroll animated
                            instead of an instant jump.
                        */
                        block: 'start'
                        /*
                            block: 'start' aligns the section to the top
                            of the viewport when scrolling.
                        */
                    });
                }
            }
        });
    });
});

/*
    That's it! This is a minimal JavaScript file that just makes
    the navigation links scroll smoothly to sections instead of
    jumping instantly. As you learn more, you can add:
    
    - Animations
    - Form validation
    - Interactive features
    - Dynamic content loading
    - And much more!
*/
