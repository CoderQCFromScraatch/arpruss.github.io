// MIT license
class SingleGamepad {
    constructor(index) {
        this.id = null
        this.index = index
        this.currentMSecs = null
    }

    matches(gamepad) {
        return gamepad && this.index != null && gamepad.id == this.id &&
            gamepad.buttons.length == this.currentButtons.length && gamepad.axes.length == this.currentAxes.length
    }

    getGamepad(i) {
        var gamepads = navigator.getGamepads()
        if (gamepads == null || gamepads.length <= i || !gamepads[i])
            return null
        return gamepads[i]
    }

    update(currentMSecs) {
        if (this.currentMSecs == currentMSecs)
            return

        var gamepad = this.getGamepad(this.index)

        if (gamepad == null) {
            this.id = null
            this.currentButtons = []
            this.previousButtons = []
            this.currentAxes = []
            this.previousAxes = []
            return
        }

        this.currentMSecs = currentMSecs

        if (!this.matches(gamepad)) {
            this.id = gamepad.id

            this.previousButtons = []
            for (var i = 0; i < gamepad.buttons.length; i++) {
                this.previousButtons.push(false)
            }

            this.previousAxes = []
            for (var i = 0; i < gamepad.axes.length; i++) {
                this.previousAxes.push(0)
            }
        } else {
            this.previousButtons = this.currentButtons
            this.previousAxes = this.previousAxes
        }

        this.currentButtons = []
        for (var i = 0; i < gamepad.buttons.length; i++) {
            this.currentButtons.push(gamepad.buttons[i].pressed)
        }

        this.currentAxes = []
        for (var i = 0; i < gamepad.axes.length; i++) {
            this.currentAxes.push(gamepad.axes[i])
        }
    }

    pressedReleased(currentMSecs, i, pr) {
        this.update(currentMSecs)

        if (i < this.currentButtons.length) {
            return this.currentButtons[i] != this.previousButtons[i] && this.currentButtons[i] == pr
        }

        return false
    }

    changedAxis(currentMSecs, i) {
        this.update(currentMSecs)

        if (i < this.currentAxes.length)
            return this.currentAxes[i] != this.previousAxes[i]

        return false
    }

    getButton(currentMSecs, i) {
        this.update(currentMSecs)
        console.log("" + currentMSecs + " " + i + this.currentButtons)
        if (i < this.currentButtons.length) {
            return this.currentButtons[i]
        } else {
            return false
        }
    }

    getAxis(currentMSecs, i) {
        this.update(currentMSecs)
        if (i < this.currentAxes.length)
            return this.currentAxes[i]
        else
            return 0
    }

    rumble(s, w, t, i) {
        var gamepad = this.gamepads[i].getGamepad()
        if (gamepad != null && gamepad.vibrationActuator) {
            gamepad.vibrationActuator.playEffect("dual-rumble", {
                duration: 1000 * t,
                strongMagnitude: Math.max(0, Math.min(s, 1)),
                weakMagnitude: Math.max(0, Math.min(w, 1))
            });
        }
    }
}

class ScratchGamepad {
    constructor(runtime) {
        this.id = null
        this.runtime = runtime
        this.gamepads = []
        for (var i = 0; i < 4; i++)
            this.gamepads.push(new SingleGamepad(i))
    }

    getInfo() {
        return {
            "id": "Gamepad",
            "name": "Gamepad",
            "blocks": [{
                    "opcode": "buttonPressedReleased",
                    "blockType": "hat",
                    "text": "button [b] [pr] of pad [i]",
                    "arguments": {
                        "b": {
                            "type": "number",
                            "defaultValue": "1"
                        },
                        "pr": {
                            "type": "number",
                            "defaultValue": "1",
                            "menu": "pressReleaseMenu"
                        },
                        "i": {
                            "type": "number",
                            "defaultValue": "1",
                            "menu": "padMenu"
                        },
                    },
                },
                {
                    "opcode": "buttonDown",
                    "blockType": "Boolean",
                    "text": "button [b] of pad [i] is down",
                    "arguments": {
                        "b": {
                            "type": "number",
                            "defaultValue": "1"
                        },
                        "i": {
                            "type": "number",
                            "defaultValue": "1",
                            "menu": "padMenu"
                        },
                    },
                },
                {
                    "opcode": "axisMoved",
                    "blockType": "hat",
                    "text": "axis [b] of pad [i] moved",
                    "arguments": {
                        "b": {
                            "type": "number",
                            "defaultValue": "1"
                        },
                        "i": {
                            "type": "number",
                            "defaultValue": "1",
                            "menu": "padMenu"
                        },
                    },
                },
                {
                    "opcode": "axisValue",
                    "blockType": "reporter",
                    "text": "axis [b] of pad [i] value",
                    "arguments": {
                        "b": {
                            "type": "number",
                            "defaultValue": "1"
                        },
                        "i": {
                            "type": "number",
                            "defaultValue": "1",
                            "menu": "padMenu"
                        },
                    },
                },
                {
                    "opcode": "controllerName",
                    "blockType": "reporter",
                    "text": "name of pad [i]",
                    "arguments": {
                        "i": {
                            "type": "number",
                            "defaultValue": "1",
                            "menu": "padMenu"
                        },
                    },
                },
                {
                    "opcode": "xboxMapping",
                    "blockType": "reporter",
                    "text": "[x] on Xbox",
                    "arguments": {
                        "x": {
                            "type": "string",
                            "defaultValue": "A",
                            "menu": "xboxControllerMap"
                        },
                    },
                },
                {
                    "opcode": "rumble",
                    "blockType": "command",
                    "text": "rumble strong [s] and weak [w] for [t] sec. on pad [i]",
                    "arguments": {
                        "s": {
                            "type": "number",
                            "defaultValue": "0.25"
                        },
                        "w": {
                            "type": "number",
                            "defaultValue": "0.5"
                        },
                        "t": {
                            "type": "number",
                            "defaultValue": "0.25"
                        },
                        "i": {
                            "type": "number",
                            "defaultValue": "1",
                            "menu": "padMenu"
                        },
                    },
                },
            ],
            "menus": {
                "pressReleaseMenu": [{
                    text: "press",
                    value: 1
                }, {
                    text: "release",
                    value: 0
                }],
                "xboxControllerMap": [{
                        text: "A",
                        value: "A"
                    }, {
                        text: "B",
                        value: "B"
                    }, {
                        text: "X",
                        value: "X"
                    }, {
                        text: "Y",
                        value: "Y"
                    }, {
                        text: "LB",
                        value: "LB"
                    }, {
                        text: "RB",
                        value: "RB"
                    }, {
                        text: "LT",
                        value: "LT"
                    },
                    {
                        text: "RT",
                        value: "RT"
                    },
                    {
                        text: "Select",
                        value: "Select"
                    },
                    {
                        text: "Start",
                        value: "Start"
                    },
                    {
                        text: "LS",
                        value: "LS"
                    },
                    {
                        text: "RS",
                        value: "RS"
                    },
                    {
                        text: "Up",
                        value: "Up"
                    },
                    {
                        text: "Down",
                        value: "Down"
                    },
                    {
                        text: "Left",
                        value: "Left"
                    },
                    {
                        text: "Right",
                        value: "Right"
                    },
                    {
                        text: "Home",
                        value: "Home"

                    }
                ],

                "padMenu": {
                    acceptReporters: true,
                    items: [{
                        text: "1",
                        value: 1
                    }, {
                        text: "2",
                        value: 2
                    }, {
                        text: "3",
                        value: 3
                    }, {
                        text: "4",
                        value: 4
                    }],
                }
            }
        };
    }

    buttonPressedReleased({
        b,
        pr,
        i
    }) {
        return this.gamepads[i - 1].pressedReleased(this.runtime.currentMSecs, b - 1, pr)
    }

    axisMoved({
        b,
        i
    }) {
        return this.gamepads[i - 1].changedAxis(this.runtime.currentMSecs, b - 1)
    }
    controllerName({
        i
    }) {
        try {
            return navigator.getGamepads()[i - 1]["id"]
        } catch {
            return ""
        }
    }

    axisValue({
        b,
        i
    }) {
        return this.gamepads[i - 1].getAxis(this.runtime.currentMSecs, b - 1)
    }

    buttonDown({
        b,
        i
    }) {
        return this.gamepads[i - 1].getButton(this.runtime.currentMSecs, b - 1)
    }

    rumble({
        s,
        w,
        t,
        i
    }) {
        this.gamepads[i - 1].rumble(s, w, t)
    }
xboxMapping({x}) {
         switch (x) {
            case 'A':
                return 1
                break
            case 'B':
                return 2
                break
            case 'X':
                return 3
                break
            case 'Y':
                return 4
                break
            case 'LB':
                return 5
                break
            case 'RB':
                return 6
                break
            case 'LT':
                return 7
                break
            case 'RT':
                return 8
                break
            case 'Select':
                return 9
                break
            case 'Start':
                return 10
                break
            case 'LS':
                return 11
                break
            case 'RS':
                return 12
                break
            case 'Up':
                return 13
                break
            case 'Down':
                return 14
                break
            case 'Left':
                return 15
                break
            case 'Right':
                return 16
                break
            case 'Home':
                return 17
                break
			default:
				return false;
				break;

        }
    }
}

(function() {
    var extensionInstance = new ScratchGamepad(window.vm.extensionManager.runtime)
    var serviceName = window.vm.extensionManager._registerInternalExtension(extensionInstance)
    window.vm.extensionManager._loadedExtensions.set(extensionInstance.getInfo().id, serviceName)
})()
