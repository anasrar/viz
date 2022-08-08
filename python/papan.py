import os
import sys
import json
from typing import Union, cast
import mouse
import keyboard
from time import sleep

import threading
import psutil


def pid_exit() -> None:
    """
        exit using pid
    """
    while True:
        if not psutil.pid_exists(int(sys.argv[1])):
            os._exit(0)
        sleep(5)


if len(sys.argv) > 1:
    threading.Thread(target=pid_exit).start()


def stdin_exit() -> None:
    """
        exit usig stdin exit
    """
    while True:
        for line in sys.stdin:
            if line.strip() == "exit":
                os._exit(0)
        sleep(5)


threading.Thread(target=stdin_exit).start()


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

    print(f"{out}\n")
    sys.stdout.flush()


# initial support for mouse
# not invoked just yet, because pkexec env resulting segmentation fault
# mouse.hook(mouse_handler)


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
    print(f"{out}\n")
    sys.stdout.flush()


keyboard.hook(keyboard_handler)
keyboard.wait()
