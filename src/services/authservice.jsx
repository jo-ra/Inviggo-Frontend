class AuthService{
    async register(username,password,phoneNumber){
         try {
            const response = await fetch("http://localhost:8080/auth/register", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    username: username,
                    password: password,
                    phoneNumber: phoneNumber
                })
            });

            const data = await response.text(); // Your backend returns string
            
            if (response.ok) {
                return { success: true, message: data };
            } else {
                throw new Error(data || 'Registration failed');
            }
        } catch (error) {
            throw new Error(error.message || 'Network error');
        }
    
    }


    async login(username, password) {
        try {
            const response = await fetch("http://localhost:8080/auth/login", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    username: username,
                    password: password
                })
            });

            const token = await response.text(); // Your backend returns JWT as string
            
            if (response.ok) {
                // Store token and user info
                const userInfo = {
                    username: username,
                    token: token
                };
                localStorage.setItem("user", JSON.stringify(userInfo));
                return { success: true, user: userInfo };
            } else {
                throw new Error(token || 'Login failed');
            }
        } catch (error) {
            throw new Error(error.message || 'Network error');
        }
    }


    logout(){
        localStorage.removeItem("user");
    }


    getCurrentUser() {
        const user = localStorage.getItem("user");
        return user ? JSON.parse(user) : null;
    }

    getToken() {
        const user = this.getCurrentUser();
        return user ? user.token : null;
    }

    isAuthenticated() {
        return this.getToken() !== null;
    }
}

export default new AuthService();