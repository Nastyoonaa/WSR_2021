import React, { useState } from "react";
import "./App.css";
import { Container, Form, FormControl } from "react-bootstrap";
import { abi } from "./contract_abi";
import Web3 from "web3";

function App() {
  const web3 = new Web3("http://127.0.0.1:8545");
  const cntrct = new web3.eth.Contract(
    abi,
    "0x66f11516239254D18D74744d63810de3e7A5Ec09"
  );
  const [messages, setMessages] = useState([]);
  const answers = [];
  const feedbacks = [];
  const [wallets, setWallets] = useState([]);
  const [currentUser, setCurrentUser] = useState({});
  const [mainWallet, setMainWallet] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    const message = e.target.text.value.split(" ");
    let command = message[0];

    if (command === "/help") {
      if (currentUser) {
        setMessages([
          ...messages,
          [
            "1. /help -- команда для получния команд" +
              "2. /register [имя] [фамилия] [пароль] [логин] -- регистрация в системe" +
              "3. /auth [логин] [пароль]  -- авторизация в системe" +
              "4. /getRole [Seller, Admin] -- запрос роли (Администратора/Продавца)" +
              "5. /setLike [feedbackId]" +
              "6. /setDislike [feedbackId]" +
              "7. /addAnswer [feedbackId] [text]" +
              "8. /addFeedback [marketAddress] [score] [text]",
          ],
        ]);
      }

      if (currentUser.role >= 1) {
        setMessages([
          ...messages,
          [
            "1. /requestMBalance -- запрос средств для магазина" +
              "2. /requestRmRole [Seller, Admin] -- запрос на удаление роли (Администратора/Продавца)",
          ],
        ]);
      }

      if (currentUser.role === 2) {
        setMessages([
          ...messages,
          [
            "1. /setRole [userId] [Seller, Admin]  -- установка роли (Администратора/Продавца)" +
              "2. /removeRole [Seller, Admin] --  удаление роли (Администратора/Продавца)",
          ],
        ]);
      }

      setMessages([
        ...messages,
        [
          "1. /help -- команда для получния команд" +
            "2. /register [имя] [фамилия] [пароль] [логин] -- регистрация в системe" +
            "3. /auth [логин] [пароль]  -- авторизация в системe",
        ],
      ]);
    } else if (command === "/register") {
      const givenName = message[1];
      const familyName = message[2];
      const password = message[3];
      const login = message[4];
      await cntrct.methods
        .register(givenName, familyName, password, login)
        .call({ from: "0x4c86789488cd70406bd67a36e0685fd748d844a0" })
        .then((result) => {
          console.log(result);
          setMessages([...messages, "User successfully registered"]);
        })
        .catch((error) => {
          console.log(error);
          setMessages([...messages, "Something was wrong"]);
        });
    } else if (command === "/auth") {
      const password = message[2];
      const login = message[1];
      await cntrct.methods
        .auth(login, password)
        .call({ from: "0x4c86789488cd70406bd67a36e0685fd748d844a0" })
        .then((result) => {
          setCurrentUser(result);
          setMessages([...messages, "User successfully authorized"]);
        })
        .catch((error) => {
          console.log(error);
          setMessages([...messages, "Something was wrong"]);
        });
    } else if (command === "/getRole") {
      if (message[1] === "Admin") {
        await cntrct.methods
          .setSellerRole(message[1])
          .call({ from: "0x4c86789488cd70406bd67a36e0685fd748d844a0" })
          .then((result) => {
            console.log(result);
            setMessages([
              ...messages,
              "User successfully create request to get Admin role",
            ]);
          })
          .catch((error) => {
            console.log(error);
            setMessages([...messages, "Something was wrong"]);
          });
      } else if (message[1] === "Seller") {
        await cntrct.methods
          .setAdminRole(message[1])
          .call({ from: "0x4c86789488cd70406bd67a36e0685fd748d844a0" })
          .then((result) => {
            console.log(result);
            setMessages([
              ...messages,
              "User successfully create request to get Seller role",
            ]);
          })
          .catch((error) => {
            console.log(error);
            setMessages([...messages, "Something was wrong"]);
          });
      }
    } else if (command === "/setLike") {
      await cntrct.methods
        .addLike(message[1])
        .call({ from: "0x4c86789488cd70406bd67a36e0685fd748d844a0" })
        .then((result) => {
          console.log(result);
          setMessages([...messages, "User successfully set like to feedback"]);
        })
        .catch((error) => {
          console.log(error);
          setMessages([...messages, "Something was wrong"]);
        });
    } else if (command === "/setDislike") {
      await cntrct.methods
        .addLike(message[1])
        .call({ from: "0x4c86789488cd70406bd67a36e0685fd748d844a0" })
        .then((result) => {
          console.log(result);
          setMessages([
            ...messages,
            "User successfully set dislike to feedback",
          ]);
        })
        .catch((error) => {
          console.log(error);
          setMessages([...messages, "Something was wrong"]);
        });
    } else if (command === "/addAnswer") {
      await cntrct.methods
        .addAnswer(message[1], message[2])
        .call({ from: "0x4c86789488cd70406bd67a36e0685fd748d844a0" })
        .then((result) => {
          console.log(result);
          answers.push("new answer");
          setMessages([
            ...messages,
            `Customer successfully create answer № ${answers.length + 1}`,
          ]);
        })
        .catch((error) => {
          console.log(error);
          setMessages([...messages, "Something was wrong"]);
        });
    } else if (command === "/addFeedback") {
      await cntrct.methods
        .addFeedback(message[1], message[2], message[3])
        .call({ from: "0x4c86789488cd70406bd67a36e0685fd748d844a0" })
        .then((result) => {
          console.log(result);
          feedbacks.push("new feedback");
          setMessages([
            ...messages,
            `Customer successfully create feedback № ${feedbacks.length + 1}`,
          ]);
        })
        .catch((error) => {
          console.log(error);
          setMessages([...messages, "Something was wrong"]);
        });
    } else if (command === "/requestMBalance") {
      await cntrct.methods
        .getMoney(message[1])
        .call({ from: "0x4c86789488cd70406bd67a36e0685fd748d844a0" })
        .then((result) => {
          console.log(result);
          setMessages([
            ...messages,
            `Seller successfully send new money request to shop`,
          ]);
        })
        .catch((error) => {
          console.log(error);
          setMessages([...messages, "Something was wrong"]);
        });
    } else if (command === "/removeRole") {
      await cntrct.methods
        .removeRole(message[1])
        .call({ from: "0x4c86789488cd70406bd67a36e0685fd748d844a0" })
        .then((result) => {
          console.log(result);
          setMessages([...messages, `Admin successfully remove users role`]);
        })
        .catch((error) => {
          console.log(error);
          setMessages([...messages, "Something was wrong"]);
        });
    } else if (command === "/requestRmRole") {
      await cntrct.methods
        .requestRemoveRole()
        .call({ from: "0x4c86789488cd70406bd67a36e0685fd748d844a0" })
        .then((result) => {
          console.log(result);
          setMessages([
            ...messages,
            `User successfully create request remove role`,
          ]);
        })
        .catch((error) => {
          console.log(error);
          setMessages([...messages, "Something was wrong"]);
        });
    } else if (command === "/setRole") {
      if (message[2] === "Admin") {
        await cntrct.methods
          .setAdminRole(message[1])
          .call({ from: "0x4c86789488cd70406bd67a36e0685fd748d844a0" })
          .then((result) => {
            console.log(result);
            setMessages([
              ...messages,
              `Admin successfully set admins role to user`,
            ]);
          })
          .catch((error) => {
            console.log(error);
            setMessages([...messages, "Something was wrong"]);
          });
      } else if (message[2] === "Seller") {
        await cntrct.methods
          .setSellerRole(message[1])
          .call({ from: "0x4c86789488cd70406bd67a36e0685fd748d844a0" })
          .then((result) => {
            console.log(result);
            setMessages([
              ...messages,
              `Admin successfully set sellers role to user`,
            ]);
          })
          .catch((error) => {
            console.log(error);
            setMessages([...messages, "Something was wrong"]);
          });
      }
    } else if (command === "/removeRole") {
      await cntrct.methods
        .removeRole(message[1])
        .call({ from: "0x4c86789488cd70406bd67a36e0685fd748d844a0" })
        .then((result) => {
          console.log(result);
          setMessages([
            ...messages,
            `Admin successfully remove role from user`,
          ]);
        })
        .catch((error) => {
          console.log(error);
          setMessages([...messages, "Something was wrong"]);
        });
    }

    e.target.text.value = "";
  };

  return (
    <Container fluid>
      <div className="app">
        {/* Header here */}

        <div className="header">
          <h3 className="text-center mt-3 mb-3">BLOCKMARKET</h3>
        </div>

        {/* Main content */}

        <div className="content mb-3">
          <div className="commands">
            <ul className="commandList">
              <li>
                {">"} Добро пожаловать в BLOCKMARKET. Введите /help для
                получения списка команд.
              </li>
              {messages.map((message) => (
                <li key={1 + Math.random()}>
                  {">"} {message}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Input field */}

        <Form onSubmit={(e) => handleSubmit(e)}>
          <FormControl
            type="text"
            name="text"
            id="text"
            className="text"
            placeholder="Enter command here"
          />
        </Form>
      </div>
    </Container>
  );
}

export default App;
