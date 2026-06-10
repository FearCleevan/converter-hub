declare module "spark-md5" {
  class SparkMD5 {
    static hash(str: string, raw?: boolean): string;
    static hashBinary(str: string, raw?: boolean): string;
    append(str: string): SparkMD5;
    appendBinary(str: string): SparkMD5;
    end(raw?: boolean): string;
    reset(): SparkMD5;
    static ArrayBuffer: {
      new (): {
        append(buffer: ArrayBuffer): void;
        end(raw?: boolean): string;
        reset(): void;
      };
    };
  }
  export = SparkMD5;
}
