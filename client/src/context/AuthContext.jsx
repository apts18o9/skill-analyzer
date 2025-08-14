//connecting to backend via axios
import React, {createContext, useState, useEffect} from "react"
import axios from "axios"

const AuthContext = createContext(); //make AuthContext as context

export const AuthProvider = ({children}) => {
    const [user, setUser] = useState(null)
    const [loading, setLoading] = useState(true);


    //checking for token with useEffect

    useEffect(() => {
        const token = localStorage.getItem('token');
        if(token){
            //if token exists fetch user details

            axios.get('http://localhost:5000/api/users/profile', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            })
            .then(response => {
                setUser(response.data) //user object
            })
            .catch(() => {
                localStorage.removeItem('token') //if token is invalid, remove
                setUser(null);
            })
            .finally(() => {
                setLoading(false);
            })
        }
        else{
            setLoading(false);
        }
    }, [])


    //function to handle logic part
    const login = async (email, password) => {
        try {

            const res = await axios.post('http://localhost:5000/api/auth/login', { email, password });
            localStorage.setItem('token', res.data.token);
            setUser(res.data);
            return res.data;
            
        } catch (error) {
            console.error('Login Failed', error.response.data.message);
            throw error;
            
        }
    }

    //function to handle logout

    const logout = () => {
        localStorage.removeItem('token');
        setUser(null)
    }

    //to handle registration

    const register = async (username, email, password) => {
        try {

            const res = await axios.post('http://localhost:5000/api/auth/register', {username, email, password})
            localStorage.setItem('token', res.data.token)
            setUser(res.data)
            return res.data
            
        } catch (error) {
            console.error('Registration fail', error.response.data.message);
            throw error
            
        }
    }


    //function to get current user profile

    const getProfile = async (token) => {
        try {
            const res = await axios.get('http://localhost:5000/api/users/profile', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            setUser(res.data)
            return res.data;
            
        } catch (error) {
            console.error('Failed to fetch profile', error);
            logout();
            throw error;
            
        }
    }
    
    //to update user's profile

    const updateProfile = async (profileData) => {
        const token = localStorage.getItem('token');
        if(!token) throw new Error('No token found')

        try {
            const res = await axios.put('http://localhost:5000/api/users/profile', profileData,  {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            setUser(res.data.user)
            return res.data
        } catch (error) {
            console.error('Failed to update profile', error);
            throw error;
            
        }
    }
    

    const value = {user, login, logout, register, updateProfile, getProfile, loading} //pass this as obj

    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    )
}

export default AuthContext;