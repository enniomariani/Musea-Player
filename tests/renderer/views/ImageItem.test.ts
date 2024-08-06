/**
 * @jest-environment jsdom
 */

import {ImageItem} from "renderer/views/images/ImageItem.js";

describe('Video Class', () => {
    let imageItem: ImageItem;
    let mockContainer: HTMLImageElement;
    let mockClassList: DOMTokenList;

    beforeEach(() => {

        mockClassList = {
            add: jest.fn()
        } as unknown as DOMTokenList;

        mockContainer = {
            src: 'test.png',
            style: {transition: '', opacity: 0},
            classList: mockClassList,
            addEventListener: jest.fn(),
            removeEventListener: jest.fn(),
        } as unknown as HTMLImageElement;

        imageItem = new ImageItem("test.png", 2, mockContainer);
    });

    afterEach(() => {
        jest.clearAllMocks();
        jest.useRealTimers();
    });

    it('should initialize correctly with an image-source and fade time', () => {
        expect(imageItem.container.src).toBe('test.png');
        expect(imageItem.container.style.opacity).toBe('0');
        expect(imageItem.container.style.transition).toBe('opacity 2s ease-in-out');
    });

    it('should show the image (change opacity to 1)', async ():Promise<void> => {
        jest.useFakeTimers();

        imageItem.show();
        jest.advanceTimersByTime(50);

        expect(imageItem.container.style.opacity).toBe('1');
    });

    it('should fade out the image and dispatch an event', (done) => {
        const dispatchEventSpy = jest.spyOn(imageItem, 'dispatchEvent');

        jest.useFakeTimers();
        imageItem.fadeOut();

        jest.advanceTimersByTime(2000);

        expect(imageItem.container.style.opacity).toBe('0');
        expect(dispatchEventSpy).toHaveBeenCalledWith(expect.objectContaining({
            type: ImageItem.EVENT_IMG_FADED_OUT
        }));
        done();
    });
});
