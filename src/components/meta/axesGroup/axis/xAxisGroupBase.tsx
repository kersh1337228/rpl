import React from "react"
import {AxesGroupReal} from "../AxesGroup"
import Drawing from "../../drawings/Drawing/Drawing"
import Axis from "../../axes/axis/Axis"
import {axisSize} from "../../Figure/Figure"

export default abstract class xAxisGroupBase extends Axis<AxesGroupReal> {
    // Methods
    public transform_coordinates(drawings: Drawing<any>[]): void {
        this.value.min = Math.min.apply(null, drawings.map(drawing => drawing.min('x')))
        this.value.max = Math.max.apply(null, drawings.map(drawing => drawing.max('x')))
    }
    // Display
    public set_window(): void {
        if (this.canvases.scale.ref.current && this.canvases.tooltip.ref.current) {
            this.canvases.scale.ref.current.width = this.axes.width
            this.canvases.scale.ref.current.height = axisSize.x
            this.canvases.tooltip.ref.current.width = this.axes.width
            this.canvases.tooltip.ref.current.height = axisSize.x
        }
    }
    public async show_grid(): Promise<void> {}
    public abstract show_scale(): Promise<void>
    public abstract show_tooltip(i: number): Promise<void>
    // Event handlers
    public async mouseMoveHandler(event: React.MouseEvent): Promise<void> {
        if (this.canvases.tooltip.mouse_events.drag) {
            const window = (event.target as HTMLCanvasElement).getBoundingClientRect()
            const x_offset = (
                this.canvases.tooltip.mouse_events.position.x - (
                    event.clientX - window.left
                )) * this.axes.state.data_amount / 1000000
            if (x_offset) {
                let data_range = {start: 0, end: 1}
                Object.assign(data_range, this.axes.state.data_range)
                if (x_offset < 0) {
                    data_range.start = data_range.start + x_offset <= 0 ?
                        0 : (data_range.end - (data_range.start + x_offset)) * this.axes.total_data_amount > 1000 ?
                            data_range.start : data_range.start + x_offset
                } else if (x_offset > 0) {
                    data_range.start = (data_range.end - (data_range.start + x_offset)) * this.axes.total_data_amount < 5 ?
                        data_range.start : data_range.start + x_offset
                }
                if (data_range.start !== this.axes.state.data_range?.start) {
                    await this.axes.recalculate_metadata(data_range, () => {
                        let state = this.axes.state
                        state.xAxis.canvases.tooltip.mouse_events.position = {
                            x: event.clientX - window.left,
                            y: event.clientY - window.top,
                        }
                        this.axes.setState(state)
                    })
                }
            }
        }
    }
    public mouseOutHandler(): void {
        let state = this.axes.state
        state.xAxis.canvases.tooltip.mouse_events.drag = false
        this.axes.setState(state)
    }
    public mouseDownHandler(event: React.MouseEvent): void {
        let state = this.axes.state
        state.xAxis.canvases.tooltip.mouse_events = {
            drag: true,
            position: {
                x: event.clientX - (
                    event.target as HTMLCanvasElement
                ).getBoundingClientRect().left,
                y: event.clientY - (
                    event.target as HTMLCanvasElement
                ).getBoundingClientRect().top,
            }
        }
        this.axes.setState(state)
    }
    public mouseUpHandler(): void {
        let state = this.axes.state
        state.xAxis.canvases.tooltip.mouse_events.drag = false
        this.axes.setState(state)
    }
    public render(): React.ReactNode {
        return this.axes.props.xAxis === false ? null :
            <><canvas
                ref={this.canvases.scale.ref}
                className={'axes x scale'}
                style={{
                    width: this.axes.props.size.width,
                    height: axisSize.x,
                    gridRowStart: this.axes.state.children.nodes.length + 1,
                    gridRowEnd: this.axes.state.children.nodes.length + 2
                }}
            ></canvas><canvas
                ref={this.canvases.tooltip.ref}
                className={'axes x tooltip'}
                style={{
                    width: this.axes.props.size.width,
                    height: axisSize.x,
                    gridRowStart: this.axes.state.children.nodes.length + 1,
                    gridRowEnd: this.axes.state.children.nodes.length + 2
                }}
                onMouseMove={this.mouseMoveHandler}
                onMouseOut={this.mouseOutHandler}
                onMouseDown={this.mouseDownHandler}
                onMouseUp={this.mouseUpHandler}
            ></canvas></>
    }
}
