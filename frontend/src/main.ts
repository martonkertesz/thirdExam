import { z } from "zod";

type Response<Type> =
  | {
      success: true;
      status: number;
      data: Type;
    }
  | {
      success: false;
      status: number | null;
    };

type Method = "GET" | "POST" | "PATCH" | "DELETE";

export const safeFetch = async <Schema extends z.ZodTypeAny>(config: {
  method: Method;
  url: string;
  schema: Schema;
  payload?: any;
}): Promise<Response<z.infer<typeof config.schema>>> => {
  const { method, url, schema, payload } = config;
  try {
    const response = await fetch(url, {
      method,
      headers: payload
        ? {
            "Content-Type": "application/JSON",
          }
        : {},
      body: payload ? JSON.stringify(payload) : undefined,
    });

    if (response.status >= 500)
      return { success: false, status: response.status };

    if (response.status >= 400)
      return { success: false, status: response.status };

    const data = await response.json();

    const result = schema.safeParse(data);
    if (!result.success) return { success: false, status: response.status };

    return { data: result.data, success: true, status: response.status };
  } catch (error) {
    return { success: false, status: null };
  }
};



const UserSchema = z.object({
    email: z.string().email(),
    password: z.string().min(5),
    confirmPassword: z.string(),
});


const emailInput = document.getElementById("email") as HTMLInputElement;
const passwordInput = document.getElementById("password") as HTMLInputElement;
const confirmPasswordInput = document.getElementById("confirmPassword") as HTMLInputElement;
const registerButton = document.getElementById("register") as HTMLButtonElement;
const successMessage = document.getElementById("successMessage") as HTMLDivElement;
const errorMessage = document.getElementById("errorMessage") as HTMLDivElement;


const isValidEmail = (email: string): boolean => {
    const pattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return pattern.test(email);
};


const isValidPassword = (password: string): boolean => {
    return password.length >= 5;
};


const validateForm = (): boolean => {
    let isValid = true;

    
    if (!isValidEmail(emailInput.value)) {
        emailInput.classList.add("border-red-500");
        isValid = false;
    } else {
        emailInput.classList.remove("border-red-500");
        emailInput.classList.add("border-green-500");
    }

   
    if (!isValidPassword(passwordInput.value)) {
        passwordInput.classList.add("border-red-500");
        isValid = false;
    } else {
        passwordInput.classList.remove("border-red-500");
        passwordInput.classList.add("border-green-500");
    }

   
    if (passwordInput.value !== confirmPasswordInput.value) {
        confirmPasswordInput.classList.add("border-red-500");
        isValid = false;
    } else {
        confirmPasswordInput.classList.remove("border-red-500");
        confirmPasswordInput.classList.add("border-green-500");
    }

   
    registerButton.disabled = !isValid;

    return isValid;
};


const hideErrorMessage = () => {
    errorMessage.classList.add("hidden");
};


const showSuccessMessage = () => {
    successMessage.classList.remove("hidden");
    emailInput.value = "";
    passwordInput.value = "";
    confirmPasswordInput.value = "";
    emailInput.classList.remove("border-red-500", "border-green-500");
    passwordInput.classList.remove("border-red-500", "border-green-500");
    confirmPasswordInput.classList.remove("border-red-500", "border-green-500");
    registerButton.disabled = true;
};

const registerUser = async () => {
    if (!validateForm()) {
        return;
    }

    const response = await safeFetch({
        method: "POST",
        url: "http://localhost:4001/api/register",
        schema: UserSchema,
        payload: {
            email: emailInput.value,
            password: passwordInput.value,
            confirmPassword: confirmPasswordInput.value,
        },
    });

    if (response.success) {
        showSuccessMessage();
    } else {
        errorMessage.textContent = "Registration unsuccessful. Please try again.";
        errorMessage.classList.remove("hidden");
    }
};


registerButton.addEventListener("click", registerUser);
emailInput.addEventListener("input", hideErrorMessage);
passwordInput.addEventListener("input", hideErrorMessage);
confirmPasswordInput.addEventListener("input", hideErrorMessage);
