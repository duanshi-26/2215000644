const API_BASE_URL = 'http://20.244.56.144/evaluation-service/auth';
const ACCESS_CODE = 'CNneGT'; 

export const registerAndGetToken = async () => {
  try {
    const registerResponse = await fetch(`${API_BASE_URL}/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ accessCode: ACCESS_CODE }),
    });

    if (!registerResponse.ok) {
      const errorDetails = await registerResponse.text();
      throw new Error(`Registration failed: ${errorDetails}`);
    }

    const registerData = await registerResponse.json();

    const authResponse = await fetch(`${API_BASE_URL}/authenticate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ 
        username: registerData.username,
        password: registerData.password 
      }),
    });

    if (!authResponse.ok) {
      const errorDetails = await authResponse.text();
      throw new Error(`Authentication failed: ${errorDetails}`);
    }

    const authData = await authResponse.json();
    localStorage.setItem('accessToken', authData.token);
    return authData.token;
  } catch (error) {
    console.error('Error in registerAndGetToken:', error);
    throw error;
  }
};

export const getAccessToken = async () => {
  let token = localStorage.getItem('accessToken');
  
  if (!token) {
    token = await registerAndGetToken();
  }
  
  return token;
};