## 🧠 Product Thinking: The "150-Minute" Sprint

Building with AI is easy; building the **right** thing at speed is hard. Here were the key product decisions made to ensure a 2.5-hour launch:

### 1. Value Proposition: Privacy as a Feature
Market research shows users are increasingly wary of sharing financial social circles with cloud servers. By choosing a **Local-First architecture**, I eliminated the need for:
- Sign-up/Login friction.
- Data privacy concerns.
- Server maintenance costs.

### 2. Strategic Trade-offs
- **Tech Debt:** I knowingly traded a centralized database for a **JSON Export/Import** feature. This met the requirement of "sharing data with friends" without the 3-hour overhead of setting up Firebase/Auth.
- **Scope Creep:** Removed "Receipt OCR" from the MVP. While a "wow" feature, it wasn't core to the "Settlement" value proposition.

### 3. Execution Logic
The core "Settle Up" feature uses a greedy matching algorithm. The decision here was to prioritize **reducing the number of transactions** over complex payment gateway integrations, keeping the user journey focused on *information* rather than *payment*.
