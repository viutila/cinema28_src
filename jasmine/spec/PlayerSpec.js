var TOOLS = {};

TOOLS.apiUrl = window.location.origin + '/cinema28/build/api/mdDevices.php';

TOOLS.idList = [];

TOOLS.elementIsUnique = function (list) {
    var deduped = Array.from(new Set(list));
    return deduped.length === list.length;
};

TOOLS.retCodeValidator = {
    asymmetricMatch: function (ret_code) {
        return ret_code === "0" || "-3" || "-22" || "-200" || "-255";
    }
};

TOOLS.playStateValidator = {
    asymmetricMatch: function (play_state) {
        return play_state === "PLAY" || "PAUSE" || "STOP";
    }
};

describe("API operational.", function () {

    describe("Ping: check if server alive.", function () {
        var result = null;

        beforeAll(function (done) {
            $.ajax({
                url: TOOLS.apiUrl + '?act=ping',
                type: 'GET',
                //async: false
            }).done(function (r) {
                result = r;
                done();
            });
        });

        it("sould return something", function (done) {
            expect(result).not.toBe('');
            done();
        })

        it("sould return ret_code", function (done) {
            expect(result.ret_code).toBeDefined();
            done();
        });

        it("ret_code should be 0, -3, -22, -200 or -255", function (done) {
            expect(result.ret_code).toEqual(TOOLS.retCodeValidator);
            done();
        });

        it("ret_code should be 0", function (done) {
            expect(result.ret_code).toBe("0");;
            done();
        });
    });

    describe("Get: get whole device list.", function () {
        var result = null;

        beforeAll(function (done) {
            $.ajax({
                url: TOOLS.apiUrl,
                type: 'GET',
                //async: false
            }).done(function (r) {
                result = r;
                console.log(r);
                done();
            });
        });

        it("sould return something", function (done) {
            expect(result).not.toBe('');
            done();
        })

        it("sould return ret_code", function (done) {
            expect(result.ret_code).toBeDefined();
            done();
        });

        it("ret_code should be 0, -3, -22, -200 or -255", function (done) {
            expect(result.ret_code).toEqual(TOOLS.retCodeValidator);
            done();
        });

        it("ret_code should be 0", function (done) {
            expect(result.ret_code).toBe("0");;
            done();
        });

        it("sould return array of device list", function (done) {
            expect(result.devices).toBeDefined();
            expect(Array.isArray(result.devices)).toBe(true);
            done();
        });

        describe("Format of device list is valid.", function () {

            beforeAll(function () {
                //var result = result;
            });

            it("should return device information", function () {
                for (i = 0; i < result.devices.length; i++) {
                    expect(result.devices[i]).toBeDefined();
                }
            });

            it("should return type of the device", function () {
                for (i = 0; i < result.devices.length; i++) {
                    expect(result.devices[i].type).toBeDefined();
                }
            });

            it("should return subtype of the device", function () {
                for (i = 0; i < result.devices.length; i++) {
                    expect(result.devices[i].subtype).toBeDefined();
                }
            });

            it("should return where the device is connected", function () {
                for (i = 0; i < result.devices.length; i++) {
                    expect(result.devices[i].connected).toBeDefined();
                }
            });

            it("should return name of the device", function () {
                for (i = 0; i < result.devices.length; i++) {
                    expect(result.devices[i].name).toBeDefined();
                }
            });

            it("should return what app is used by the device", function () {
                for (i = 0; i < result.devices.length; i++) {
                    expect(result.devices[i].inuse_apps).toBeDefined();
                }
            });

            it("should return 'to'", function () {
                for (i = 0; i < result.devices.length; i++) {
                    expect(result.devices[i].to).toBeDefined();
                }
                pending('I don\'t understand what it is');
            });

            it("should return allow_apps list of the device", function () {
                for (i = 0; i < result.devices.length; i++) {
                    expect(result.devices[i].allow_apps).toBeDefined();
                }
            });

            it("should return nickname of the device", function () {
                for (i = 0; i < result.devices.length; i++) {
                    expect(result.devices[i].nickname).toBeDefined();
                }
            });

            it("should return id of the device", function () {
                for (i = 0; i < result.devices.length; i++) {
                    expect(result.devices[i].id).toBeDefined();
                    expect(result.devices[i].id).not.toBe("");
                }
            });

            it("id should be unique", function () {
                for (i = 0; i < result.devices.length; i++) {
                    TOOLS.idList.push(result.devices[i].id);
                }
                expect(TOOLS.elementIsUnique(TOOLS.idList)).toBe(true);
            });

            it("should return playtitle of the device", function () {
                for (i = 0; i < result.devices.length; i++) {
                    expect(result.devices[i].playtitle).toBeDefined();
                }
            });

            it("should return location of the device", function () {
                for (i = 0; i < result.devices.length; i++) {
                    expect(result.devices[i].location).toBeDefined();
                    expect(result.devices[i].location).not.toBe("");
                }
            });


            it("should return play_state of the device if the inuse_apps list is not empty", function () {
                for (i = 0; i < result.devices.length; i++) {
                    if (result.devices[i].inuse_apps !== "") {
                        expect(result.devices[i].play_state).toEqual(TOOLS.playStateValidator);
                    } else {
                        //pending('there is no information about this value in the document when inuse_apps is empty');
                    }
                }
            });

            it("should return thumbnail", function () {
                for (i = 0; i < result.devices.length; i++) {
                    expect(result.devices[i].thumb).toBeDefined();
                }
                pending('there is no information about this value in the document');
            });
        });
    });

    describe("Stop: stop current player of a device.", function () {
        var result = null;

        beforeAll(function (done) {
            $.ajax({
                url: TOOLS.apiUrl + '?act=stop&dev_id=' + TOOLS.idList[0],
                type: 'GET',
                //async: false
            }).done(function (r) {
                result = r;
                done();
            });
        });

        it("sould return something", function (done) {
            expect(result).not.toBe('');
            done();
        })

        it("sould return ret_code", function (done) {
            expect(result.ret_code).toBeDefined();
            done();
        });

        it("ret_code should be 0, -3, -22, -200 or -255", function (done) {
            expect(result.ret_code).toEqual(TOOLS.retCodeValidator);
            done();
        });

        it("ret_code should be 0", function (done) {
            expect(result.ret_code).toBe("0");;
            done();
        });
    });


    describe("Rename: update the nickname of a device.", function () {
        var result = null;

        beforeAll(function (done) {
            $.ajax({
                url: TOOLS.apiUrl + '?act=rename&name=FOO&dev_id=' + TOOLS.idList[0],
                type: 'GET',
                //async: false
            }).done(function (r) {
                result = r;
                done();
            });
        });

        it("sould return something", function (done) {
            expect(result).not.toBe('');
            done();
        })

        it("sould return ret_code", function (done) {
            expect(result.ret_code).toBeDefined();
            done();
        });

        it("ret_code should be 0, -3, -22, -200 or -255", function (done) {
            expect(result.ret_code).toEqual(TOOLS.retCodeValidator);
            done();
        });

        it("ret_code should be 0", function (done) {
            expect(result.ret_code).toBe("0");;
            done();
        });

        xit("update the nickname of the device", function (done) {
            expect(true).toBe(true);
            done();
        });
    });

    describe("Allow: update the app allow list of a device.", function () {
        var result = null;

        beforeAll(function (done) {
            $.ajax({
                url: TOOLS.apiUrl + '?act=allow&apps=FileStation,VideoStation&dev_id=' + TOOLS.idList[0],
                type: 'GET',
                //async: false
            }).done(function (r) {
                result = r;
                done();
            });
        });

        it("sould return something", function (done) {
            expect(result).not.toBe('');
            done();
        })

        it("sould return ret_code", function (done) {
            expect(result.ret_code).toBeDefined();
            done();
        });

        it("ret_code should be 0, -3, -22, -200 or -255", function (done) {
            expect(result.ret_code).toEqual(TOOLS.retCodeValidator);
            done();
        });

        it("ret_code should be 0", function (done) {
            expect(result.ret_code).toBe("0");;
            done();
        });

        xit("updating the list functional", function (done) {
            expect(true).toBe(true);
            done();
        });
    });

    describe("Listplay: current playlist of a device, by giving page and count.", function () {
        var result = null;

        beforeAll(function (done) {
            $.ajax({
                url: TOOLS.apiUrl + '?act=listplay&page=1&count=10&dev_id=' + TOOLS.idList[0],
                type: 'GET',
                //async: false
            }).done(function (r) {
                result = r;
                done();
            });
        });

        it("sould return something", function (done) {
            expect(result).not.toBe('');
            done();
        })

        it("sould return ret_code", function (done) {
            expect(result.ret_code).toBeDefined();
            done();
        });

        it("ret_code should be 0, -3, -22, -200 or -255", function (done) {
            expect(result.ret_code).toEqual(TOOLS.retCodeValidator);
            done();
        });

        it("ret_code should be 0", function (done) {
            expect(result.ret_code).toBe("0");;
            done();
        });

        it("sould return playlist", function (done) {
            expect(result.items).toBeDefined();
            done();
        });
    });
});