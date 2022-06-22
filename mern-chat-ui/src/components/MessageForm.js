import React, { useContext, useRef } from "react";
import { useEffect } from "react";
import { useState } from "react";
import { Button, Col, Form, Row } from "react-bootstrap";
import { useSelector } from "react-redux";
import { AppContext } from "../context/appContext";
import "./messageForm.css";
const MessageForm = () => {
  const [message, setMessage] = useState("");
  const { socket, currentRoom, setMessages, messages, privateMemberMsg } =
    useContext(AppContext);
  const user = useSelector((state) => state.user);
  const messageEndRef = useRef(null);
  socket.off("room-messages").on("room-messages", (roomMessages) => {
    setMessages(roomMessages);
  });

  const scrollToBottom = () => {
    messageEndRef.current?.scrollIntoView({
      behaviour: "smooth",
    });
  };
  useEffect(() => {
    scrollToBottom();
  }, [messages]);
  const getFormattedDate = () => {
    const date = new Date();

    const year = date.getFullYear();

    let month = (1 + date.getMonth()).toString();

    month = month.length > 1 ? month : "0" + month;
    let day = date.getDate().toString();

    day = day.length > 1 ? day : "0" + day;
    return month + "/" + day + "/" + year;
  };

  const todayDate = getFormattedDate();
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!message) {
      return;
    }
    const today = new Date();
    const minutes =
      today.getMinutes() < 10 ? "0" + today.getMinutes() : today.getMinutes();

    const time = today.getHours() + ":" + minutes;
    const roomId = currentRoom;
    socket.emit("message-room", roomId, message, user, time, todayDate);
    setMessage("");
  };
  return (
    <>
      <div className="message-output">
        {user && !privateMemberMsg?._id && (
          <div className="alert alert-info">
            You are in the {currentRoom} room
          </div>
        )}
        {user && privateMemberMsg?._id && (
          <>
            <div className="alert alert-info conversation-info">
              <div style={{ fontSize: "24px" }}>
                Your conversation with {privateMemberMsg.name}
                <img
                  className="conversation-profile-picture"
                  src={
                    privateMemberMsg.picture
                      ? privateMemberMsg.picture
                      : "https://image.shutterstock.com/image-vector/no-image-available-vector-hand-260nw-745639717.jpg"
                  }
                  alt="profile-img"
                />
              </div>
            </div>
          </>
        )}
        {!user && <div className="alert alert-danger">Please login!!!</div>}

        {user &&
          messages.map(({ _id: date, messagesByDate }, idx) => (
            <div key={idx}>
              <p className="alert alert-info text-center message-date-indicator">
                {date}
              </p>
              {messagesByDate?.map(
                ({ content, time, from: sender }, msgIdx) => (
                  <div
                    className={
                      sender?.email === user?.email
                        ? "message"
                        : "incoming-message"
                    }
                    key={msgIdx}
                  >
                    <div className="message-inner">
                      <div className="d-flex align-items-center mb-3">
                        <img
                          src={
                            sender.picture
                              ? sender.picture
                              : "https://image.shutterstock.com/image-vector/no-image-available-vector-hand-260nw-745639717.jpg"
                          }
                          style={{
                            width: 35,
                            height: 35,
                            objectFit: "cover",
                            borderRadius: "50%",
                            marginRight: 10,
                          }}
                          alt="prof-img"
                        />
                        <p className="message-sender">
                          {sender._id === user?._id ? "You" : sender.name}
                        </p>
                      </div>
                      <p className="message-content">{content}</p>
                      <p className="message-timestamp-left">{time}</p>
                    </div>
                  </div>
                )
              )}
            </div>
          ))}
        <div ref={messageEndRef} />
      </div>
      <Form onSubmit={handleSubmit}>
        <Row>
          <Col md={11}>
            <Form.Group>
              <Form.Control
                disabled={!user}
                type="text"
                placeholder="Your message"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
              ></Form.Control>
            </Form.Group>
          </Col>
          <Col md={1}>
            <Button
              variant="primary"
              disabled={!user}
              type="submit"
              style={{ width: "100%", backgroundColor: "orange" }}
            >
              <i className="fas fa-paper-plane"></i>
            </Button>
          </Col>
        </Row>
      </Form>
    </>
  );
};

export default MessageForm;
