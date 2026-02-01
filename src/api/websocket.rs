use axum::{
    extract::ws::{WebSocketUpgrade, WebSocket},
    response::Response,
};
use futures::{sink::SinkExt, stream::StreamExt};
use tokio_tungstenite::tungstenite::Message;

pub async fn handle_websocket(ws: WebSocketUpgrade) -> Response {
    ws.on_upgrade(handle_socket)
}

async fn handle_socket(mut socket: WebSocket) {
    while let Some(msg) = socket.recv().await {
        let msg = if let Ok(msg) = msg {
            msg
        } else {
            // client disconnected
            return;
        };

        match msg {
            Message::Text(text) => {
                // Parse subscription request
                // For MVP, echo back
                if socket.send(Message::Text(text)).await.is_err() {
                    // client disconnected
                    return;
                }
            }
            Message::Close(_) => {
                return;
            }
            _ => {}
        }
    }
}