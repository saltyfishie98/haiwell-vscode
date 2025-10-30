import { make_type, PropertyInfo, VariableInfo } from "./types";

export const PREDEFINED_OBJECTS: {
    [key: string]: PropertyInfo[];
} = {
    Common: [
        { name: "MobileBarcodescanner", type: make_type.Function() },
        {
            name: "Format",
            type: make_type.Function("num: number", "type_str: string"),
        },
        {
            name: "logger",
            type: make_type.Object({
                log: make_type.Function("fmt: string"),
                debug: make_type.Function("fmt: string"),
                info: make_type.Function("fmt: string"),
                trace: make_type.Function("fmt: string"),
                warn: make_type.Function("fmt: string"),
                error: make_type.Function("fmt: string"),
                note: make_type.Function("fmt: string"),
            }),
        },
    ],
    Math: [
        { name: "random", type: make_type.Function() },
        { name: "floor", type: make_type.Function() },
        { name: "ceil", type: make_type.Function() },
        { name: "PI", type: make_type.Number() },
        { name: "E", type: make_type.Number() },
    ],
};

export const PREDEFINED_VARIABLES: { [key: string]: VariableInfo } = {
    Volume: {
        type: make_type.Number(),
        rawType: "INT",
        description: "Volume adjustment(Range: 0-100)",
    },
    MuteVolume: {
        type: make_type.Boolean(),
        rawType: "BOOL",
        description: "Mute Volume (0: OFF, 1: ON)",
    },
    UserName: {
        type: make_type.String(),
        rawType: "STRING",
        description: "User name",
    },
    UserGroup: {
        type: make_type.String(),
        rawType: "STRING",
        description: "User group",
    },
    UserPrivilegeLevel: {
        type: make_type.Number(),
        rawType: "UINT",
        description: "Group permissions",
    },
    TimeControl: {
        type: make_type.Boolean(),
        rawType: "BOOL",
        description: "0: Manual setting 1: Network timing",
    },
    Year: {
        type: make_type.Number(),
        rawType: "UINT",
        description: "The year of local time (range: 2000-2036),format:20xx",
    },
    Month: {
        type: make_type.Number(),
        rawType: "UINT",
        description: "The month of local time (range: 01-12)",
    },
    Day: {
        type: make_type.Number(),
        rawType: "UINT",
        description: "The day of local time (range: 01-31)",
    },
    Hour: {
        type: make_type.Number(),
        rawType: "UINT",
        description: "The hour of local time (range: 0-23)",
    },
    Minute: {
        type: make_type.Number(),
        rawType: "UINT",
        description: "The minute of local time (range: 0-59)",
    },
    Second: {
        type: make_type.Number(),
        rawType: "UINT",
        description: "The second of local time(range: 0-59)",
    },
    Week: {
        type: make_type.Number(),
        rawType: "INT",
        description: "The week of system date (range: 0-6)",
    },
    Date: {
        type: make_type.String(),
        rawType: "STRING",
        description: "System date",
    },
    Time: {
        type: make_type.String(),
        rawType: "STRING",
        description: "System time",
    },
    TerminalName: {
        type: make_type.String(),
        rawType: "STRING",
        description: "Display the terminal name",
    },
    TerminalCode: {
        type: make_type.String(),
        rawType: "STRING",
        description: "Display the terminal code",
    },
    TerminalPn: {
        type: make_type.String(),
        rawType: "STRING",
        description: "Display the terminal PN code",
    },
    SoftwareVersion1: {
        type: make_type.Number(),
        rawType: "UINT",
        description:
            "Display the 1st byte of firmware version, for example 3 in the 3.24.1.25",
    },
    SoftwareVersion2: {
        type: make_type.Number(),
        rawType: "UINT",
        description:
            "Display the 2nd byte of firmware version, for example 24 in the 3.24.1.25",
    },
    SoftwareVersion3: {
        type: make_type.Number(),
        rawType: "UINT",
        description:
            "Display the 3rd byte of firmware version, for example 1 in the 3.24.1.25",
    },
    SoftwareVersion4: {
        type: make_type.Number(),
        rawType: "UINT",
        description:
            "Display the 4th byte of firmware version, for example 25 in the 3.24.1.25",
    },
    BuzzerSw: {
        type: make_type.Boolean(),
        rawType: "BOOL",
        description: "0: not enabled; 1: enabled",
    },
    ScreenLux: {
        type: make_type.Number(),
        rawType: "UINT",
        description: "Screen luminance (range: 20~100)",
    },
    ScreenSaverTime: {
        type: make_type.Number(),
        rawType: "UINT",
        description:
            "Set up screen saver timeout (s) , 0: Disable screen saver.",
    },
    TimeBetweenClicksScreen: {
        type: make_type.Number(),
        rawType: "Long",
        description:
            "Displays how long the current touch screen has not been clicked, using decimal unsigned double word (numeric parts). Note: Whichever user clicks on the screen will reset the register.",
    },
    ScreenBacklightCtrl: {
        type: make_type.Boolean(),
        rawType: "BOOL",
        description:
            "0: The touch screen backlight is OFF 1: The touch screen backlight is ON",
    },
    TouchStatus: {
        type: make_type.Number(),
        rawType: "INT",
        description:
            "0: No tapping on screen, 1: Tapping on screen, 2: Long press on screen",
    },
    RestartDevice: {
        type: make_type.Boolean(),
        rawType: "BOOL",
        description: "1: Restart device",
    },
    DualEthernetType: {
        type: make_type.Boolean(),
        rawType: "BOOL",
        description: "Support dual network port, 0: NO, 1: YES",
    },
    WiFiType: {
        type: make_type.Boolean(),
        rawType: "BOOL",
        description: "Support WiFi, 0: NO, 1: YES",
    },
    _4GType: {
        type: make_type.Boolean(),
        rawType: "BOOL",
        description: "Support 4G, 0: NO, 1: YES",
    },
    UFreeSpace: {
        type: make_type.Number(),
        rawType: "UINT",
        description: "Free space of USB flash driver. (Unit: Mbyte)",
    },
    SysFreeSpace: {
        type: make_type.Number(),
        rawType: "UINT",
        description: "Free space of system. (Unit: Mbyte)",
    },
    LocalTotalSpace: {
        type: make_type.Number(),
        rawType: "UINT",
        description: "Total space of local storage. (Unit: Mbyte)",
    },
    LocalFreeSpace: {
        type: make_type.Number(),
        rawType: "UINT",
        description: "Free space of local storage. (Unit: Mbyte)",
    },
    RecipeuploadHint: {
        type: make_type.Boolean(),
        rawType: "BOOL",
        description: "Recipe uploads succesfully prompt, 0: hint, 1: not hint",
    },
    RecipedownloadHint: {
        type: make_type.Boolean(),
        rawType: "BOOL",
        description:
            "Recipe downloads succesfully prompt, 0: hint, 1: not hint",
    },
    ProjectName: {
        type: make_type.String(),
        rawType: "STRING",
        description: "Project name",
    },
    ProjectMemo: {
        type: make_type.String(),
        rawType: "STRING",
        description: "Project description",
    },
    ProjectFullName: {
        type: make_type.String(),
        rawType: "STRING",
        description: "Project file path",
    },
    ProjectCompany: {
        type: make_type.String(),
        rawType: "STRING",
        description: "Company name",
    },
    ProjectAuthor: {
        type: make_type.String(),
        rawType: "STRING",
        description: "Project author",
    },
    ProjectCopyright: {
        type: make_type.String(),
        rawType: "STRING",
        description: "Project copyright",
    },
    ProjectLanguageId: {
        type: make_type.Number(),
        rawType: "INT",
        description: "Set up language ID",
    },
    ShowWindowId: {
        type: make_type.Number(),
        rawType: "INT",
        description: "The ID of display",
    },
    RunTime: {
        type: make_type.String(),
        rawType: "STRING",
        description: "The running time of device",
    },
    RunSecond: {
        type: make_type.Number(),
        rawType: "Long",
        description: "The running time of device in second",
    },
    StartDateTime: {
        type: make_type.String(),
        rawType: "STRING",
        description: "The time when device starts running",
    },
    LAN1IP1: {
        type: make_type.Number(),
        rawType: "UINT",
        description: "The 1st byte of LAN1 IP address",
    },
    LAN1IP2: {
        type: make_type.Number(),
        rawType: "UINT",
        description: "The 2nd byte of LAN1 IP address",
    },
    LAN1IP3: {
        type: make_type.Number(),
        rawType: "UINT",
        description: "The 3rd byte of LAN1 IP address",
    },
    LAN1IP4: {
        type: make_type.Number(),
        rawType: "UINT",
        description: "The 4th byte of LAN1 IP address",
    },
    LAN1mask1: {
        type: make_type.Number(),
        rawType: "UINT",
        description: "The 1st byte of LAN1 subnet mask",
    },
    LAN1mask2: {
        type: make_type.Number(),
        rawType: "UINT",
        description: "The 2nd byte of LAN1 subnet mask",
    },
    LAN1mask3: {
        type: make_type.Number(),
        rawType: "UINT",
        description: "The 3rd byte of LAN1 subnet mask",
    },
    LAN1mask4: {
        type: make_type.Number(),
        rawType: "UINT",
        description: "The 4th byte of LAN1 subnet mask",
    },
    LAN1Gateway1: {
        type: make_type.Number(),
        rawType: "UINT",
        description: "The 1st byte of LAN1 grateway IP address",
    },
    LAN1Gateway2: {
        type: make_type.Number(),
        rawType: "UINT",
        description: "The 2nd byte of LAN1 grateway IP address",
    },
    LAN1Gateway3: {
        type: make_type.Number(),
        rawType: "UINT",
        description: "The 3rd byte of LAN1 grateway IP address",
    },
    LAN1Gateway4: {
        type: make_type.Number(),
        rawType: "UINT",
        description: "The 4th byte of LAN1 grateway IP address",
    },
    DNSP1: {
        type: make_type.Number(),
        rawType: "UINT",
        description: "The 1st byte of Preferred DNS IP address",
    },
    DNSP2: {
        type: make_type.Number(),
        rawType: "UINT",
        description: "The 2nd byte of Preferred DNS IP address",
    },
    DNSP3: {
        type: make_type.Number(),
        rawType: "UINT",
        description: "The 3rd byte of Preferred DNS IP address",
    },
    DNSP4: {
        type: make_type.Number(),
        rawType: "UINT",
        description: "The 4th byte of Preferred DNS IP address",
    },
    LAN1MAC1: {
        type: make_type.Number(),
        rawType: "UINT",
        description: "The 1st byte LAN1 MAC address",
    },
    LAN1MAC2: {
        type: make_type.Number(),
        rawType: "UINT",
        description: "The 2nd byte LAN1 MAC address",
    },
    LAN1MAC3: {
        type: make_type.Number(),
        rawType: "UINT",
        description: "The 3rd byte LAN1 MAC address",
    },
    LAN1MAC4: {
        type: make_type.Number(),
        rawType: "UINT",
        description: "The 4th byte LAN1 MAC address",
    },
    LAN1MAC5: {
        type: make_type.Number(),
        rawType: "UINT",
        description: "The 5th byte LAN1 MAC address",
    },
    LAN1MAC6: {
        type: make_type.Number(),
        rawType: "UINT",
        description: "The 6th byte LAN1 MAC address",
    },
    WifiSignalStrength: {
        type: make_type.Number(),
        rawType: "UINT",
        description: "WiFi signal strength (range 0~4)",
    },
    _4GSignalStrength: {
        type: make_type.Number(),
        rawType: "UINT",
        description: "4G signal strength (range 0~5)",
    },
    SIMCardNumber: {
        type: make_type.String(),
        rawType: "STRING",
        description: "The SIM card number",
    },
    _4G: {
        type: make_type.Boolean(),
        rawType: "BOOL",
        description: "4G 0:OFF 1:ON",
    },
    SIMICCID: {
        type: make_type.String(),
        rawType: "STRING",
        description:
            "Display the ICCID information of the inserted SIM card on the device.",
    },
    ESIMICCID: {
        type: make_type.String(),
        rawType: "STRING",
        description:
            "Display the ICCID information of the inserted eSIM card on the device.",
    },
    CurrentSIMType: {
        type: make_type.Number(),
        rawType: "UINT",
        description:
            "Display the current type of SIM type being used by the device.0:None,1:eSIM,2:SIM",
    },
    _4GModel: {
        type: make_type.Number(),
        rawType: "UINT",
        description:
            "Display the current 4G Model.0:Force to use eSIM,1:Force to use SIM",
    },
    _4GDNSIP1: {
        type: make_type.Number(),
        rawType: "UINT",
        description: "4G card the 1th byte of the DNS IP address",
    },
    _4GDNSIP2: {
        type: make_type.Number(),
        rawType: "UINT",
        description: "4G card the 2th byte of the DNS IP address",
    },
    _4GDNSIP3: {
        type: make_type.Number(),
        rawType: "UINT",
        description: "4G card the 3th byte of the DNS IP address",
    },
    _4GDNSIP4: {
        type: make_type.Number(),
        rawType: "UINT",
        description: "4G card the 4th byte of the DNS IP address",
    },
    _4GDNSConfiguration: {
        type: make_type.Boolean(),
        rawType: "BOOL",
        description: "DNS configuration of 4G card (0:Static IP 1:DHCP)",
    },
    Modify4GcardDNS: {
        type: make_type.Boolean(),
        rawType: "BOOL",
        description: "Set to 1,update the IP information of 4G card DNS",
    },
    LAN1NetworkType: {
        type: make_type.Boolean(),
        rawType: "BOOL",
        description: "The network type of LAN1 (0:Static IP 1:DHCP)",
    },
    ModifyLAN1: {
        type: make_type.Boolean(),
        rawType: "BOOL",
        description: "Set to 1, update the IP information of LAN1",
    },
    WiFiIP1: {
        type: make_type.Number(),
        rawType: "UINT",
        description: "The 1st byte of WiFi IP address",
    },
    WiFiIP2: {
        type: make_type.Number(),
        rawType: "UINT",
        description: "The 2st byte of WiFi IP address",
    },
    WiFiIP3: {
        type: make_type.Number(),
        rawType: "UINT",
        description: "The 3st byte of WiFi IP address",
    },
    WiFiIP4: {
        type: make_type.Number(),
        rawType: "UINT",
        description: "The 4st byte of WiFi IP address",
    },
    WiFimask1: {
        type: make_type.Number(),
        rawType: "UINT",
        description: "The 1st byte of WiFi subnet mask",
    },
    WiFimask2: {
        type: make_type.Number(),
        rawType: "UINT",
        description: "The 2st byte of WiFi subnet mask",
    },
    WiFimask3: {
        type: make_type.Number(),
        rawType: "UINT",
        description: "The 3st byte of WiFi subnet mask",
    },
    WiFimask4: {
        type: make_type.Number(),
        rawType: "UINT",
        description: "The 4st byte of WiFi subnet mask",
    },
    WiFiGateway1: {
        type: make_type.Number(),
        rawType: "UINT",
        description: "The 1st byte of WiFi grateway IP address",
    },
    WiFiGateway2: {
        type: make_type.Number(),
        rawType: "UINT",
        description: "The 2st byte of WiFi grateway IP address",
    },
    WiFiGateway3: {
        type: make_type.Number(),
        rawType: "UINT",
        description: "The 3st byte of WiFi grateway IP address",
    },
    WiFiGateway4: {
        type: make_type.Number(),
        rawType: "UINT",
        description: "The 4st byte of WiFi grateway IP address",
    },
    WiFiDNSIP1: {
        type: make_type.Number(),
        rawType: "UINT",
        description: "The 1st byte of WiFi DNS IP address",
    },
    WiFiDNSIP2: {
        type: make_type.Number(),
        rawType: "UINT",
        description: "The 2st byte of WiFi DNS IP address",
    },
    WiFiDNSIP3: {
        type: make_type.Number(),
        rawType: "UINT",
        description: "The 3st byte of WiFi DNS IP address",
    },
    WiFiDNSIP4: {
        type: make_type.Number(),
        rawType: "UINT",
        description: "The 4st byte of WiFi DNS IP address",
    },
    WiFiMAC1: {
        type: make_type.Number(),
        rawType: "UINT",
        description: "The 1st byte WiFi MAC address",
    },
    WiFiMAC2: {
        type: make_type.Number(),
        rawType: "UINT",
        description: "The 2st byte WiFi MAC address",
    },
    WiFiMAC3: {
        type: make_type.Number(),
        rawType: "UINT",
        description: "The 3st byte WiFi MAC address",
    },
    WiFiMAC4: {
        type: make_type.Number(),
        rawType: "UINT",
        description: "The 4st byte WiFi MAC address",
    },
    WiFiMAC5: {
        type: make_type.Number(),
        rawType: "UINT",
        description: "The 5st byte WiFi MAC address",
    },
    WiFiMAC6: {
        type: make_type.Number(),
        rawType: "UINT",
        description: "The 6st byte WiFi MAC address",
    },
    WiFiNetworkType: {
        type: make_type.Boolean(),
        rawType: "BOOL",
        description: "The network type of WiFi (0:Static IP  1:DHCP)",
    },
    ModifyWiFi: {
        type: make_type.Boolean(),
        rawType: "BOOL",
        description: "Set to 1, update the IP information of WiFi",
    },
    LAN2IP1: {
        type: make_type.Number(),
        rawType: "UINT",
        description: "The 1st byte of LAN2 IP address",
    },
    LAN2IP2: {
        type: make_type.Number(),
        rawType: "UINT",
        description: "The 2nd byte of LAN2 IP address",
    },
    LAN2IP3: {
        type: make_type.Number(),
        rawType: "UINT",
        description: "The 3rd byte of LAN2 IP address",
    },
    LAN2IP4: {
        type: make_type.Number(),
        rawType: "UINT",
        description: "The 4th byte of LAN2 IP address",
    },
    LAN2mask1: {
        type: make_type.Number(),
        rawType: "UINT",
        description: "The 1st byte of LAN2 subnet mask",
    },
    LAN2mask2: {
        type: make_type.Number(),
        rawType: "UINT",
        description: "The 2nd byte of LAN2 subnet mask",
    },
    LAN2mask3: {
        type: make_type.Number(),
        rawType: "UINT",
        description: "The 3rd byte of LAN2 subnet mask",
    },
    LAN2mask4: {
        type: make_type.Number(),
        rawType: "UINT",
        description: "The 4th byte of LAN2 subnet mask",
    },
    LAN2Gateway1: {
        type: make_type.Number(),
        rawType: "UINT",
        description: "The 1st byte of LAN2 grateway IP address",
    },
    LAN2Gateway2: {
        type: make_type.Number(),
        rawType: "UINT",
        description: "The 2nd byte of LAN2 grateway IP address",
    },
    LAN2Gateway3: {
        type: make_type.Number(),
        rawType: "UINT",
        description: "The 3rd byte of LAN2 grateway IP address",
    },
    LAN2Gateway4: {
        type: make_type.Number(),
        rawType: "UINT",
        description: "The 4th byte of LAN2 grateway IP address",
    },
    LAN2DNSIP1: {
        type: make_type.Number(),
        rawType: "UINT",
        description: "LAN2 DNS IP address 1",
    },
    LAN2DNSIP2: {
        type: make_type.Number(),
        rawType: "UINT",
        description: "LAN2 DNS IP address 2",
    },
    LAN3DNSIP3: {
        type: make_type.Number(),
        rawType: "UINT",
        description: "LAN2 DNS IP address 3",
    },
    LAN2DNSIP4: {
        type: make_type.Number(),
        rawType: "UINT",
        description: "LAN2 DNS IP address 4",
    },
    LAN2MAC1: {
        type: make_type.Number(),
        rawType: "UINT",
        description: "The 1st byte LAN2 MAC address",
    },
    LAN2MAC2: {
        type: make_type.Number(),
        rawType: "UINT",
        description: "The 2nd byte LAN2 MAC address",
    },
    LAN2MAC3: {
        type: make_type.Number(),
        rawType: "UINT",
        description: "The 3rd byte LAN2 MAC address",
    },
    LAN2MAC4: {
        type: make_type.Number(),
        rawType: "UINT",
        description: "The 4th byte LAN2 MAC address",
    },
    LAN2MAC5: {
        type: make_type.Number(),
        rawType: "UINT",
        description: "The 5th byte LAN2 MAC address",
    },
    LAN2MAC6: {
        type: make_type.Number(),
        rawType: "UINT",
        description: "The 6th byte LAN2 MAC address",
    },
    ModifyLAN2: {
        type: make_type.Boolean(),
        rawType: "BOOL",
        description: "Set to 1, update the IP information of LAN2",
    },
    LAN2NetworkType: {
        type: make_type.Boolean(),
        rawType: "BOOL",
        description: "The network type of LAN2 (0:Static IP 1:DHCP)",
    },
    EthernetPortMode: {
        type: make_type.Boolean(),
        rawType: "BOOL",
        description: "Ethernet port mode (0:DHCP 1:Static IP)",
    },
    LAN1: {
        type: make_type.Boolean(),
        rawType: "BOOL",
        description: "LAN1 switch, 0: off, 1: on",
    },
    LAN2: {
        type: make_type.Boolean(),
        rawType: "BOOL",
        description: "LAN2 switch, 0: off, 1: on",
    },
    WiFi: {
        type: make_type.Boolean(),
        rawType: "BOOL",
        description: "WiFi switch, 0: off, 1: on",
    },
    CloudOnline: {
        type: make_type.Boolean(),
        rawType: "BOOL",
        description: "0: Offline; 1: Online",
    },
    A_ProductKey: {
        type: make_type.String(),
        rawType: "STRING",
        description: "Product key",
    },
    A_ProductSecret: {
        type: make_type.String(),
        rawType: "STRING",
        description: "Product secret key",
    },
    A_DeviceName: {
        type: make_type.String(),
        rawType: "STRING",
        description: "Device name. Range: 4-32",
    },
    A_ClientID: {
        type: make_type.String(),
        rawType: "STRING",
        description: "Alibaba Cloud client ID",
    },
    A_Username: {
        type: make_type.String(),
        rawType: "STRING",
        description: "Alibaba Cloud username",
    },
    A_DeviceToken: {
        type: make_type.String(),
        rawType: "STRING",
        description: "Alibaba Cloud user password",
    },
    A_Register: {
        type: make_type.Number(),
        rawType: "UINT",
        description:
            "Register the device, 0:Ready 1:Register 2:Reset 3:Re-register",
    },
    A_RegistrationResult: {
        type: make_type.Number(),
        rawType: "UINT",
        description:
            "Registration result,0:disable dynamic registation 1:unregistered 2:registering 3: registration failed 4: registration successful",
    },
    A_ConnectionStatus: {
        type: make_type.Number(),
        rawType: "UINT",
        description:
            "Connection ID: 0: Not connected 1: Connecting 2: Connection failed 3: Connection successful",
    },
    Longitude: {
        type: make_type.Number(),
        rawType: "Float",
        description: "The longitude of the current device",
    },
    Latitude: {
        type: make_type.Number(),
        rawType: "Float",
        description: "The latitude of the current devicee",
    },
    ReadPosition: {
        type: make_type.Boolean(),
        rawType: "BOOL",
        description:
            "Control whether to read the latitude and longitude of the device (0: Don't read,  1: Read)",
    },
    ReadPositionInterval: {
        type: make_type.Number(),
        rawType: "ULong",
        description: "Latitude and longitude acquisition frequency",
    },
    LongitudeLatitude: {
        type: make_type.String(),
        rawType: "STRING",
        description: "Latitude and longitude of equipment",
    },
    LongitudeDirection: {
        type: make_type.String(),
        rawType: "STRING",
        description: "Longtitude direction.E:East,W:West",
    },
    LatitudeDirection: {
        type: make_type.String(),
        rawType: "STRING",
        description: "Latitude direction.N:North,S:South",
    },
    GroundSpeed: {
        type: make_type.Number(),
        rawType: "Float",
        description: "Ground speed",
    },
    CourseOverGround: {
        type: make_type.Number(),
        rawType: "Float",
        description: "Course over ground",
    },
    Elevation: {
        type: make_type.Number(),
        rawType: "Float",
        description: "Elevation",
    },
    GPSState: {
        type: make_type.Boolean(),
        rawType: "BOOL",
        description: "GPS State",
    },
    GPSSignalStrength: {
        type: make_type.Number(),
        rawType: "INT",
        description:
            "GPS signal strength: 0: no signal, 1: weak, 2: medium, 3: strong",
    },
    NauticalMile: {
        type: make_type.Number(),
        rawType: "Float",
        description: "Navigation speed, unit: nautical miles per hour",
    },
};
