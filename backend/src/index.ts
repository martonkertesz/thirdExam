import express, { Request, Response } from "express";
import { readFile, writeFile } from "fs/promises";
import { safeFetch } from "./api";
import { z } from "zod";

const server = express();
server.use(cors());    // !!! +import
server.use(express.json());


const UserSchema = z.object({
    email: z.string().email(),
    password: z.string().min(5),
    confirmPassword: z.string(),
});

type User = z.infer<typeof UserSchema>;

const getUsers = async (): Promise<User[]> => {
    try {
        const rawData = await readFile(`${__dirname}/../users.json`, "utf-8");
        const users: User[] = JSON.parse(rawData);
        return users;
    } catch (error) {

        return [];
    }
};


const saveUsers = async (users: User[]): Promise<void> => {
    await writeFile(`${__dirname}/../users.json`, JSON.stringify(users, null, 2));
};


server.post("/api/register", async (req: Request, res: Response) => {
    // const { email, password, confirmPassword } = result.data; -> ERROR?
    
    const result = UserSchema.safeParse(req.body);
    if (!result.success) {
        return res.status(400).json({ error: result.error.issues });
    }
    
    const { email, password, confirmPassword } = result.data;
    
    const users = await getUsers();
    const existingUser = users.find(user => user.email === email);
    if (existingUser) {
        return res.status(409).json({ error: "Email is already registered" });
    }

    
    const newUser: User = { email, password, confirmPassword }; //- confirm, + id
    users.push(newUser);
    await saveUsers(users);

    
    return res.status(200).json({ message: "Registration successful" });
});

server.listen(4001);

