import os
import sys
from typing import Union, cast
from socket import socket
from time import sleep
import json
import mouse
import keyboard

import threading

clients: list[socket] = []
server = socket()
server.bind(("127.0.0.1", 0))
server.listen(5)
print(f"socket server running on port: {server.getsockname()[1]}")


def send_all_client(data: str):
    for client in clients:
        client.send(f"{data}\n".encode())


def on_client_disconnect(client: socket) -> None:
    """
        remove client from clients list
    """
    try:
        while True:
            data = client.recv(1024)
            if not data:
                break
    finally:
        print(f"client disconnected: {client.getpeername()}")
        clients.remove(client)
        client.close()


def on_client_connect() -> None:
    """
        add client to clients list
    """
    while True:
        client, addr = server.accept()
        clients.append(client)
        print(f"client connected: {addr}")
        threading.Thread(target=on_client_disconnect, args=(client,)).start()


threading.Thread(target=on_client_connect).start()


def stdin_exit() -> None:
    """
        exit usig stdin exit
    """
    while True:
        for line in sys.stdin:
            if line.strip() == "exit":
                for client in clients:
                    client.close()
                server.close()
                print("socket server closed")
                os._exit(0)
        sleep(5)


threading.Thread(target=stdin_exit).start()
print("type exit and enter to stop and exit the server")


def mouse_handler(event: Union[mouse.ButtonEvent, mouse.WheelEvent, mouse.MoveEvent]) -> None:
    out: str = ""

    if isinstance(event, mouse.ButtonEvent):
        button_event = cast(mouse.ButtonEvent, event)
        out = json.dumps({
            "type": "mouse_button",
            "data": {
                "type": button_event.event_type,
                "button": button_event.button,
                "time": button_event.time,
            },
        })

    if isinstance(event, mouse.WheelEvent):
        wheel_event = cast(mouse.WheelEvent, event)
        out = json.dumps({
            "type": "mouse_wheel",
            "data": {
                "delta": wheel_event.delta,
                "time": wheel_event.time,
            },
        })

    if isinstance(event, mouse.MoveEvent):
        move_event = cast(mouse.MoveEvent, event)
        out = json.dumps({
            "type": "mouse_move",
            "data": {
                "x": move_event.x,
                "y": move_event.y,
                "time": move_event.time,
            },
        })

    send_all_client(out)


mouse.hook(mouse_handler)


def keyboard_handler(event: keyboard.KeyboardEvent) -> None:
    modifiers = event.modifiers if event.modifiers != None else []
    out = json.dumps({
        "type": "keyboard",
        "data": {
            "type": event.event_type,
            "value": event.name,
            "code": event.scan_code,
            "alias_code": [x for x in keyboard.key_to_scan_codes(event.name)] if event.name != "unknown" else [event.scan_code],
            "modifier": keyboard.is_modifier(event.scan_code),
            "modifiers": [x for x in modifiers],
            "margin": False,
        },
    })
    send_all_client(out)


keyboard.hook(keyboard_handler)
keyboard.wait()
