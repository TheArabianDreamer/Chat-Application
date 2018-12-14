    // source the relevant body parts
    const source_card_login = document.getElementById('card-body-login'), source_card_signup = document.getElementById('card-body-signup')
    const template_card_login = Handlebars.compile(source_card_login.innerHTML), template_card_signup = Handlebars.compile(source_card_signup.innerHTML)

    const card_body = document.getElementsByClassName('card-body')[0]

    // flesh out the templates: Design Contexts TODO
    const html_card_login = template_card_login()
    const html_card_signup = template_card_signup()
    card_body.innerHTML = html_card_login

    // templates logic
    const card_tab_login = document.getElementById('card-tab-login'), card_tab_signup = document.getElementById('card-tab-signup');

    function loginform() {
        // show login form in card_body. Make login tab active
        card_tab_login.classList.add("active")
        card_tab_signup.classList.remove("active")
        card_body.innerHTML = html_card_login;
    }
    function signupform() {
        // show signup form in card_body. Make signup tab active
        card_tab_login.classList.remove("active")
        card_tab_signup.classList.add("active")
        card_body.innerHTML = html_card_signup;
    }

/*

    TODO:
    * Create log in mechanism:
        - Send to server (Unique Username, Password, Id, Onboarding_Method)
        - Receive from server if problem (error in username or password?)
        - If User already logged in, Automatic login. Use cookies.

*/