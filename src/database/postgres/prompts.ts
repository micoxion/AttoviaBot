import pool from '../database.js'
import dotenv from 'dotenv'
import { Prompt } from '../../ABTypes/Prompt.js'

dotenv.config()

export async function addPrompt(promptData: Prompt) {
    let sql = "INSERT INTO Prompts (day, prompt, date, source, \"originalMessage\") VALUES ($1, $2, $3, $4, $5) RETURNING *"
    let values = [promptData.day, promptData.prompt, promptData.date, promptData.source, promptData.originalMessage]
    console.log(values)
    const client = await pool.connect();
    try {
        let res = await client.query(sql, values)
        return res.rows[0]
    } finally {
        client.release();
    }
}

export async function getPromptByDay(day: number) {
    let sql = "SELECT * FROM Prompts WHERE day = " + day.toString();
    const client = await pool.connect();
    try {
        let res = await client.query(sql)
        return res.rows[0];
    } finally {
        client.release();
    }
}

export async function getRandomPrompt() {
    let sql = "SELECT * FROM Prompts ORDER BY RANDOM() LIMIT 1"
    const client = await pool.connect();
    try {
        let res = await client.query(sql)
        return res.rows[0];
    } finally {
        client.release();
    }
}

export async function getAllPrompts() {
    let sql = "SELECT * FROM Prompts"
    const client = await pool.connect();
    try {
        let res = await client.query(sql)
        return res.rows;
    } finally {
        client.release();
    }
}