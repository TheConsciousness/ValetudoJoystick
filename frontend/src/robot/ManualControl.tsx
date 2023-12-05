import React from "react";
import {
    Box,
    //Button,
    Collapse,
    FormControlLabel,
    Grid,
    LinearProgress,
    Stack,
    Switch,
    Typography,
    //styled,
} from "@mui/material";
import {
    Capability,
    ManualControlCommand,
    useManualControlInteraction,
    useManualControlPropertiesQuery,
    useManualControlStateQuery
} from "../api";
import {useCapabilitiesSupported} from "../CapabilitiesProvider";
import {FullHeightGrid} from "../components/FullHeightGrid";
import PaperContainer from "../components/PaperContainer";
import { Joystick } from 'react-joystick-component';
/*
import {
    ArrowDownward as ArrowDownwardIcon,
    ArrowUpward as ArrowUpwardIcon,
    RotateLeft as RotateLeftIcon,
    RotateRight as RotateRightIcon,
} from "@mui/icons-material";
*/

/*
const SideButton = styled(Button)({
    width: "30%",
    height: "100%",
});

const CenterButton = styled(Button)({
    width: "100%",
});
*/

const ManualControlInternal: React.FunctionComponent = (): React.ReactElement => {
    const {
        data: manualControlState,
        isPending: manualControlStatePending,
        isError: manualControlStateError,
    } = useManualControlStateQuery();

    const {
        data: manualControlProperties,
        isPending: manualControlPropertiesPending,
        isError: manualControlPropertiesError,
    } = useManualControlPropertiesQuery();

    const {mutate: sendInteraction, isPending: interacting} = useManualControlInteraction();

    const loading = manualControlPropertiesPending || manualControlStatePending;

    const controls = React.useMemo(() => {
        if (manualControlPropertiesError || manualControlStateError || !manualControlProperties || !manualControlState) {
            return (
                <Typography color="error">Error loading manual controls</Typography>
            );
        }

        /*
        const controlsEnabled = !loading && manualControlState.enabled && !interacting;
        const forwardEnabled = controlsEnabled && manualControlProperties.supportedMovementCommands.includes("forward");
        const backwardEnabled = controlsEnabled && manualControlProperties.supportedMovementCommands.includes("backward");
        const rotateCwEnabled = controlsEnabled && manualControlProperties.supportedMovementCommands.includes("rotate_clockwise");
        const rotateCcwEnabled = controlsEnabled && manualControlProperties.supportedMovementCommands.includes("rotate_counterclockwise");
        */

        const sendMoveCommand = (command: ManualControlCommand): void => {
            sendInteraction({
                action: "move",
                movementCommand: command,
            });
        };

        const moveWithJoystick = (joystickDirection: string): void => {
            switch (joystickDirection) {
                case 'BACKWARD':
                    sendMoveCommand("backward");
                    break;
                case 'FORWARD':
                    sendMoveCommand("forward");
                    break;
                case 'RIGHT':
                    sendMoveCommand("rotate_clockwise");
                    break;
                case 'LEFT':
                    sendMoveCommand("rotate_counterclockwise");
                    break;
                default:
                    break;
            }
        };

        return (
            <>
                <FormControlLabel
                    control={
                        <Switch
                            checked={manualControlState.enabled}
                            disabled={loading || interacting}
                            onChange={(e) => {
                                sendInteraction({
                                    action: e.target.checked ? "enable" : "disable"
                                });
                            }}
                        />
                    }
                    label="Enable manual control"
                    style={{marginLeft:0}}
                />
                <Box/>

                <Stack direction="row" sx={{width: "100%", height: "30vh"}} justifyContent="center" alignItems="center">
                    <Joystick size={200} throttle={250} minDistance={50} baseColor="#005ecc" stickColor="black" move={(e)=>moveWithJoystick(e.direction?.toString() ?? "")}/>
                </Stack>
            </>
        );

    }, [
        loading,
        manualControlProperties,
        manualControlPropertiesError,
        manualControlState,
        manualControlStateError,
        sendInteraction,
        interacting,
    ]);

    return React.useMemo(() => {
        return (
            <FullHeightGrid container direction="column">
                <Grid item flexGrow={1}>
                    <Box>
                        <Collapse in={loading}>
                            <LinearProgress/>
                        </Collapse>
                        {controls}
                    </Box>
                </Grid>
            </FullHeightGrid>
        );
    }, [loading, controls]);
};

const ManualControl = (): React.ReactElement => {
    const [supported] = useCapabilitiesSupported(Capability.ManualControl);

    return (
        <PaperContainer>
            {supported ? <ManualControlInternal/> : (
                <Typography color="error">This robot does not support the manual control.</Typography>
            )}
        </PaperContainer>
    );
};

export default ManualControl;
